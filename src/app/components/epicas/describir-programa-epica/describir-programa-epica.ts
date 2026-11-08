import { Component, inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { faCheck, faCircleCheck, faFileCirclePlus, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { ObtenerErrorServicio } from '../../../servicios/obtener-error-servicio';
import { PeticionServicio } from '../../../servicios/peticion-servicio';
import { ModalMensajeServicio } from '../../../servicios/modal-mensaje-servicio';
import { DatosServicio } from '../../../servicios/datos-servicio';
import { ModalCargandoServicio } from '../../../servicios/modal-cargando-servicio';
import { AuthServiceTs } from '../../../servicios/auth.service';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { NgClass } from '@angular/common';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { IProyecto } from '../../../interfaces/iproyecto';
import { Image, ImageToolbar, ImageUpload, FileRepository, FontBackgroundColor, FontColor, ClassicEditor, Essentials, Paragraph, Heading, Bold, Italic, List, Link, BlockQuote, ImageResize, ImageStyle } from 'ckeditor5';
import { DatosFormServicio } from '../../../servicios/datos-form-servicio';
import { MatListModule } from '@angular/material/list';
import { faPenToSquare, faRectangleList } from '@fortawesome/free-regular-svg-icons';

// Adaptador para convertir imágenes pegadas o subidas a Base64
class CustomBase64Adapter {
  loader: any;
  constructor(loader: any) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then(
      (file: Blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ default: reader.result });
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        })
    );
  }
  abort() {}
}

function CustomUploadAdapterPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    return new CustomBase64Adapter(loader);
  };
}


@Component({
  selector: 'app-describir-programa-epica',
  imports: [CKEditorModule, 
    FormsModule, 
    FontAwesomeModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule, 
    ReactiveFormsModule, 
    RouterLink, 
    MatSelectModule,
    MatListModule],
  templateUrl: './describir-programa-epica.html',
  styleUrl: './describir-programa-epica.css',
})
export class DescribirProgramaEpica {
  faCheck = faCheck;
  faCircleCheck = faCircleCheck;
  faRotateLeft = faRotateLeft;
  faFileCirclePlus = faFileCirclePlus
  faPenToSquare = faPenToSquare
  faRectangleList = faRectangleList
  mostrarMensaje: boolean = false;
  mensaje: string = "";
  proyectos: IProyecto[] = [];
  epicas!: any;
  usuarios!: any;
  modoEdicion = false;
  url: string = '/epicas/crear';
  titulo: string = 'Descripción de la Épica';
  archivoPdf: File | null = null;
  archivoPdfNombre: string = '';
  archivoVideoNombre: string = '';
  archivoVideo: File | null = null;

  public Editor: any = ClassicEditor;
  public editorConfig = {
  licenseKey: 'GPL',
  plugins: [
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    FontColor,
    FontBackgroundColor,
    List,
    Link,
    BlockQuote,
    FileRepository,
    Image,          
    ImageToolbar,  
    ImageUpload,
    ImageResize, // <-- Importar
    ImageStyle
  ],
  toolbar: [
    'undo', 'redo', '|',
    'heading', '|',
    'bold', 'italic', '|',
    'fontColor', 'fontBackgroundColor', '|',
    'bulletedList', 'numberedList', '|',
    'link', 'blockQuote', 'insertImage', 'ImageResize', 
    'ImageStyle'
  ],
  image: {
    toolbar: [
      'imageStyle:inline',
      'imageStyle:block',
      'imageStyle:side',
      '|',
      'resizeImage'
    ]
  },
  link: {
    defaultProtocol: 'https://',
    addTargetToExternalLinks: true,
    decorators: {
      openInNewTab: {
        mode: 'manual' as const, // <-- 'as const' resuelve la incompatibilidad de tipo
        label: 'Abrir en nueva pestaña',
        attributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }
    }
  },
  extraPlugins: [CustomUploadAdapterPlugin]
};

  private fb = inject(FormBuilder);
  private toastrServicio = inject(ToastrService);
  private obtenerErrorServicio = inject(ObtenerErrorServicio);
  private peticionServicio = inject(PeticionServicio);
  private modalMensajeServicio = inject(ModalMensajeServicio);
  private datosServicio = inject(DatosServicio);
  private modalCargandoServicio = inject(ModalCargandoServicio);
  private authService = inject(AuthServiceTs);
  private router = inject(Router);
  private datosTempServicio = inject(DatosFormServicio);
  mostrarCrearEpica: boolean = true
  tituloRequisitos: string = "Mostrar requisitos"

  requisitos: any[] = []
 
  formulario = this.fb.group({
    id: [0],
    nombre: [{value: '', disabled: true}, [Validators.required]],
    detalle: [{value: '', disabled: true}, [Validators.required]],
    id_proyecto: [{value: '', disabled: true}, [Validators.required]],
    id_usu_asig: [{value: '', disabled: true}, [Validators.required]],
    id_prioridad: [{value: '', disabled: true}, [Validators.required]],
    id_usu_creo: [this.datosServicio.id()],
    archivo_pdf: new FormControl<File | null>({ value: null, disabled: true }),
    archivo_video: new FormControl<File | null>({ value: null, disabled: true })
  });

  listaPrioridades = [
    { id: 1, nombre: 'Crítica' },
    { id: 2, nombre: 'Alta' },
    { id: 3, nombre: 'Media' },
    { id: 4, nombre: 'Baja' }
  ];

  ngOnInit(): void {
    if(this.datosTempServicio.tieneDatos()){
      this.epicas = this.datosTempServicio.datos()
    } else {
      this.modalCargandoServicio.abrirModal(true);
      const state = globalThis?.history?.state;
      this.epicas = state?.datos;
    }
    if (this.epicas) {
      this.requisitos = this.epicas.requisitos
      this.modoEdicion = true;
      this.formulario.patchValue({
        id: this.epicas.id,
        nombre: this.epicas.nombre,
        detalle: this.epicas.detalle ?? '',
        id_proyecto: this.epicas.proyecto?.proyecto ?? '',
        //id_usu_asig: this.epicas.usuario_asignado?.id ?? null,
        id_usu_asig: (this.epicas.usuario_asignado?.nombre ?? null) as any,
        id_prioridad: this.epicas.id_prioridad ?? null
      });
    
      if (this.epicas.ruta_pdf) {
        this.archivoPdfNombre = this.epicas.ruta_pdf.split('/').pop() ?? 'Archivo adjunto';
      }
    } 
    this.modalCargandoServicio.abrirModal(false); 
  }

  cambiaMostrarFormTarea(){
    this.mostrarCrearEpica = !this.mostrarCrearEpica
    if(this.mostrarCrearEpica){
      this.tituloRequisitos = "Mostrar requisitos"
    }else{
      this.tituloRequisitos = "Ocultar requisitos"
    }
  }
}
