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
import { ListarTareas } from "../listar-tareas/listar-tareas";
import { DatosTareasServicio } from '../../../servicios/datos-tareas-servicio';
import { ModalFormularioTareaServicio } from '../../../servicios/modal-formulario-tarea';

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
  selector: 'app-crear-programa-epica',
  imports: [CKEditorModule,
    FormsModule,
    FontAwesomeModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterLink,
    MatSelectModule, ListarTareas],
  templateUrl: './crear-programa-epica.html',
  styleUrl: './crear-programa-epica.css',
})
export class CrearProgramaEpica {
  faCheck = faCheck
  faCircleCheck = faCircleCheck
  faRotateLeft = faRotateLeft
  faFileCirclePlus = faFileCirclePlus
  mostrarMensaje: boolean = false
  mensaje: string = ""
  proyectos: IProyecto[] = []
  epicas!: any;
  usuarios!: any
  modoEdicion = false
  url: string = ''
  titulo: string = 'Generar cronograma de la Épica'
  archivoPdf: File | null = null
  archivoPdfNombre: string = ''
  archivoVideoNombre: string = ''
  archivoVideo: File | null = null

  public Editor: any = ClassicEditor
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

  private fb = inject(FormBuilder)
  private toastrServicio = inject(ToastrService)
  private obtenerErrorServicio = inject(ObtenerErrorServicio)
  private peticionServicio = inject(PeticionServicio)
  private modalMensajeServicio = inject(ModalMensajeServicio)
  private datosServicio = inject(DatosServicio)
  private modalCargandoServicio = inject(ModalCargandoServicio)
  private authService = inject(AuthServiceTs)
  private router = inject(Router)
  private datosTempServicio = inject(DatosServicio)
  private datosFormServicio = inject(DatosFormServicio)
  private datosTareas = inject(DatosTareasServicio)
  private modalFormularioTareaServicio = inject(ModalFormularioTareaServicio)
  activarAceptar: boolean = false
  mostrarFormularioTareas: boolean = false
  mostrarHistoriaEpica: boolean = false

  formulario = this.fb.group({
    id: [0],
    historia: ['', [Validators.required]],
    id_epica: [null, [Validators.required]],
  });

  formularioTareas = this.fb.group({
    f_pentrega: ['', [Validators.required]],
    detalle: ['', [Validators.required]],
    id_complejidad: [null, [Validators.required]],
    id_prioridad: [null, [Validators.required]],
    id_estado: this.fb.control('1', { nonNullable: true }),
    id_epica: [null, [Validators.required]],
    id_usu_creo : this.fb.control(this.datosTempServicio.id(), { nonNullable: true }),
    id_reasig : this.fb.control(this.datosTempServicio.id(), { nonNullable: true })
  });

  listaPrioridades = [
    { id: 4, nombre: 'Crítica' },
    { id: 3, nombre: 'Alta' },
    { id: 2, nombre: 'Media' },
    { id: 1, nombre: 'Baja' }
  ];

  listaComplejidades = [
    { id: 4, nombre: 'Compleja' },
    { id: 3, nombre: 'Alta' },
    { id: 2, nombre: 'Media' },
    { id: 1, nombre: 'Baja' }
  ];

  ngOnInit(): void {    
    let datos = this.datosFormServicio.datos()
    if(Object.keys(datos).length > 0){
      this.formulario.patchValue({
        historia: datos.historia,
      })
      if (!this.formulario.get('historia')?.value?.trim()) {
        this.mostrarHistoriaEpica = true
      }
       
      
    }
    
  }

  validar(campo: string, formulario: string) {
    let form = (this as any)[formulario];
    const control = form.get(campo);
    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      return null;
    }
    return this.obtenerErrorServicio.getErrores(form, campo);
  }

  aceptar() {
    let datos = this.datosFormServicio.datos()
    this.formularioTareas.patchValue({
      id_epica: datos.id
    });
    this.url = '/tareas/crear'
    this.peticion('formularioTareas')
  }

  nuevo(){
    this.formularioTareas.reset()
    this.activarAceptar = !this.activarAceptar
  }

  nuevaTarea(){
    let datos = this.datosFormServicio.datos()
    this.modalFormularioTareaServicio.abrirModal(datos)
    /* this.formularioTareas.reset()
    this.mostrarFormularioTareas = !this.mostrarFormularioTareas */
  }

  aceptarHistoria() {
    let datos = this.datosFormServicio.datos()
    alert(datos.id)
    this.formulario.patchValue({
      id_epica: datos.id
    });
    this.url = '/epicas/editar-historia'
    this.peticion('formulario')
  }

  peticion(formulario: string){
    this.modalCargandoServicio.abrirModal(true);
    let datos = (this as any)[formulario].value;
    let form = (this as any)[formulario];
    if (form.invalid) {
      form.markAllAsTouched();
      this.modalCargandoServicio.abrirModal(false);
      this.modalMensajeServicio.abrirModal({
        mensaje: "Se presentaron errores al validar los datos. Favor verificar.",
        titulo: "Error:",
        tipo: "error"
      });
      return;
    }
    this.peticionServicio.peticion(this.url, datos, 'POST')
    .subscribe({
      next: (resp) => {
        let mensajes = "";
        if (resp.error) {
          if (resp.errores) {
            mensajes = Object.values(resp.errores)
              .flat()
              .join('\n');
          } else {
            mensajes = resp.mensaje;
          }
          
          this.modalMensajeServicio.abrirModal({
            tipo: "error",
            titulo: "Error:",
            mensaje: mensajes
          });
        } else {
          this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' });
          if (formulario === 'formularioTareas') {
            const formVal = this.formularioTareas.value;

            // 1. Búsqueda de descripciones en catálogos
            const complejidadSel = this.listaComplejidades.find(
              (item) => item.id === Number(formVal.id_complejidad)
            );
            const prioridadSel = this.listaPrioridades.find(
              (item) => item.id === Number(formVal.id_prioridad)
            );
            
            // Asumiendo que 'datos' es el objeto de la épica seleccionada
            const epicaSel = this.datosFormServicio.datos(); 
            let datosTareas = this.datosTareas.setDatosForm

            // 2. Armar el objeto completo respetando la estructura del backend
            const nuevaTareaCompleta = {
              ...formVal,
              ...datosTareas, // ⚠️ AQUÍ va la respuesta del HTTP POST (id, created_at, etc.), NO listaTareas
              activo: 0,
              f_rentrega: null,
              fec_ini: null,
              fec_fin: null,
              url_pdf: null,
              url_video: null,

              // Nombres de catálogos
              nom_complejidad: complejidadSel ? complejidadSel.nombre : '',
              nom_prioridad: prioridadSel ? prioridadSel.nombre : '',

              // Objetos anidados (Respetando el JSON original)
              estado: { id: 1, estado: 'Pendiente' },
              epica: epicaSel || null, // Objeto completo de la épica
              
              // Si tienes un método que retorna el objeto del usuario logueado en lugar de solo su ID:
              usuario_creo: this.datosTempServicio.user(), 
              usuario_asignado: this.datosTempServicio.user() 
            };

            // 3. Agregar al Signal de la Tareas
            this.datosTareas.agregarDatosForm(nuevaTareaCompleta);
            this.activarAceptar = !this.activarAceptar;
          }
        }

      },
      error: (error) => {
        this.modalMensajeServicio.abrirModal({
          tipo: "error",
          titulo: "Error:",
          mensaje: error.error?.message ?? error.error?.mensaje ?? error.message ?? 'Se presentó un error en el servidor.'
        });
      },
      complete: () => {
        this.modalCargandoServicio.abrirModal(false);
      }
    }); 
  }

  

}
