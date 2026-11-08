import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { faCheck, faCircleCheck, faPenToSquare, faRotateLeft, faTrashCan } from '@fortawesome/free-solid-svg-icons';
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
import { MatListModule } from '@angular/material/list';
import { IRequisito } from '../../../interfaces/irequisito';
import ur from '@angular/common/locales/ur';
import { faRectangleList } from '@fortawesome/free-regular-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { ModalConfirma } from '../../compartidos/modal-confirma/modal-confirma';

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
  selector: 'app-crear-epica',
  standalone: true,
  imports: [
    CKEditorModule, 
    FormsModule, 
    FontAwesomeModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule, 
    ReactiveFormsModule, 
    RouterLink, 
    MatSelectModule, 
    NgClass,
    MatListModule
  ],
  templateUrl: './crear-epica.html',
  styleUrl: './crear-epica.css'
})
export class CrearEpica implements OnInit {
  faCheck = faCheck;
  faPenToSquare = faPenToSquare
  faTrashCan = faTrashCan
  faCircleCheck = faCircleCheck
  faRotateLeft = faRotateLeft
  faRectangleList = faRectangleList
  mostrarMensaje: boolean = false
  mensaje: string = ""
  proyectos: IProyecto[] = []
  epicas!: any
  usuarios!: any
  modoEdicion = false
  url: string = '/epicas/crear'
  titulo: string = 'Crear épica'
  archivoPdf: File | null = null
  archivoPdfNombre: string = ''
  archivoVideoNombre: string = ''
  archivoVideo: File | null = null
  mostrarCrearEpica: boolean = true

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

  private fb = inject(FormBuilder);
  private toastrServicio = inject(ToastrService);
  private obtenerErrorServicio = inject(ObtenerErrorServicio);
  private peticionServicio = inject(PeticionServicio);
  private modalMensajeServicio = inject(ModalMensajeServicio);
  private datosServicio = inject(DatosServicio);
  private modalCargandoServicio = inject(ModalCargandoServicio);
  private authService = inject(AuthServiceTs);
  private router = inject(Router);
  private datosTempServicio = inject(DatosServicio);
  private dialogConfirm = inject(MatDialog);

  labelBoton: string = 'Agregar'

  formulario = this.fb.group({
    id: [0],
    nombre: ['', [Validators.required]],
    detalle: ['', [Validators.required]],
    id_proyecto: [0, [Validators.required]],
    id_usu_asig: [0],
    id_prioridad: [0, [Validators.required]],
    id_usu_creo: [this.datosTempServicio.id()],
    archivo_pdf: new FormControl<File | null>(null),
    archivo_video: new FormControl<File | null>(null)
  });

   formularioRequisito = this.fb.group({
    id: [0],
    requisito: ['', [Validators.required]],
    id_epica: [0, [Validators.required]]
  });


  listaPrioridades = [
    { id: 4, nombre: 'Crítica' },
    { id: 3, nombre: 'Alta' },
    { id: 2, nombre: 'Media' },
    { id: 1, nombre: 'Baja' }
  ];

  requisitos: any[] = [];
  activeLink = signal<string | null>(null);
  tituloRequisitos: string = "Mostrar requisitos"
  id_epica: number | null = null;
  guardado: boolean = true
  tituloBoton: string = "Guardar"

  ngOnInit(): void {
    this.modalCargandoServicio.abrirModal(true);

    forkJoin({
      proyectos: this.peticionServicio.peticion('/proyectos/consultar', null, 'GET'),
      usuarios: this.peticionServicio.peticion('/usuarios/consultar', null, 'GET')
    }).subscribe({
      next: (resp: any) => {
        if (resp.proyectos.error) {
          this.modalMensajeServicio.abrirModal({
            tipo: 'error',
            titulo: 'Error:',
            mensaje: resp.proyectos.mensaje
          });
          return;
        }

        if (resp.usuarios.error) {
          this.modalMensajeServicio.abrirModal({
            tipo: 'error',
            titulo: 'Error:',
            mensaje: resp.usuarios.mensaje
          });
          return;
        }

        this.proyectos = resp.proyectos.datos;
        this.usuarios = resp.usuarios.datos;

        const state = globalThis?.history?.state;
        this.epicas = state?.datos;
        if (this.epicas) {
          this.tituloBoton = "Editar"
          this.modoEdicion = true;
          this.formulario.patchValue({
            id: this.epicas.id,
            nombre: this.epicas.nombre,
            detalle: this.epicas.detalle ?? '',
            id_proyecto: this.epicas.proyecto?.id ?? null,
            id_usu_asig: this.epicas.usuario_asignado?.id ?? null,
            id_prioridad: this.epicas.id_prioridad ?? null
          });
          this.formularioRequisito.patchValue({
          id_epica: this.epicas.id
          })
          // Mostrar el nombre o la ruta existente si viene en los datos
          if (this.epicas.ruta_pdf) {
            this.archivoPdfNombre = this.epicas.ruta_pdf.split('/').pop() ?? 'Archivo adjunto';
          }
          let datos = this.formularioRequisito.value
          this.peticionServicio.peticion('/requisitos/consultar', datos, 'POST').subscribe(
            {
              next: (req)=>{
                this.requisitos = req.datos
              }
            }
          )
          this.url = '/epicas/editar';
          this.titulo = 'Editar épica';
        } else {
          this.titulo = 'Crear épica';
        }
      },
      error: (error) => {
        this.modalMensajeServicio.abrirModal({
          tipo: 'error',
          titulo: 'Error:',
          mensaje: 'Ocurrió un error al cargar la información inicial.'
        });
        this.modalCargandoServicio.abrirModal(false);
      },
      complete: () => {
        this.modalCargandoServicio.abrirModal(false);
      }
    });
  }

  validar(campo: string) {
    const control = this.formulario.get(campo);
    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      return null;
    }
    return this.obtenerErrorServicio.getErrores(this.formulario, campo);
    /* if (control && (control.touched || control.dirty) && control.invalid) {
      return this.obtenerErrorServicio.getErrores(this.formulario, campo);
    }
    return null; */
  }

  aceptar() {
    this.modalCargandoServicio.abrirModal(true);
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.modalCargandoServicio.abrirModal(false);
      this.modalMensajeServicio.abrirModal({
        mensaje: "Se presentaron errores al validar los datos. Favor verificar.",
        titulo: "Error:",
        tipo: "error"
      });
      return;
    }

    // Construir el FormData para soportar archivos
    const formData = new FormData();
    const formValues = this.formulario.value;

    Object.keys(formValues).forEach(key => {
      const value = formValues[key as keyof typeof formValues];
      if (value !== null && value !== undefined && key !== 'archivo_pdf' && key !== 'archivo_video') {
        formData.append(key, value.toString());
      }
    });

    // Adjuntar PDF si se seleccionó uno
    if (this.archivoPdf) {
      formData.append('archivo_pdf', this.archivoPdf, this.archivoPdf.name);
    }

    // Adjuntar Video si se seleccionó uno (usando la variable de clase)
    if (this.archivoVideo) {
      formData.append('archivo_video', this.archivoVideo, this.archivoVideo.name);
    }

    this.peticionServicio.peticion(this.url, formData, 'POST')
    .subscribe({
      next: (resp) => {
        console.log(resp)
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
          this.guardado = false
          this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' })
          this.id_epica = resp.data.id
          setTimeout(() => {
            if(!this.modoEdicion){
              this.cambiaMostrarFormTarea()
            } else{
              this.router.navigateByUrl("/epicas")
            }
          }, 1000);
        }
      },
      error: (error) => {
        this.modalMensajeServicio.abrirModal({
          tipo: "error",
          titulo: "Error:",
          mensaje: error.error?.message ?? error.error?.mensaje ?? error.message ?? 'Se presentó un error en el servidor.'
        });
        this.modalCargandoServicio.abrirModal(false);
      },
      complete: () => {
        this.modalCargandoServicio.abrirModal(false);
      }
    }); 
  }

  // Capturar el archivo al seleccionar
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoPdf = input.files[0];
      this.archivoPdfNombre = this.archivoPdf.name;
      this.formulario.patchValue({ archivo_pdf: this.archivoPdf });
    }
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      this.archivoVideo = input.files[0]; // <-- Asegurar que se asigna aquí
      this.archivoVideoNombre = this.archivoVideo.name;

      this.formulario.patchValue({
        archivo_video: this.archivoVideo
      });
    }
  }  

  editarTexto(requisito: IRequisito){
    this.labelBoton = "Editar"
    this.formularioRequisito.controls['requisito'].setValue(requisito.requisito)
    this.formularioRequisito.controls['id'].setValue(requisito.id)
  }

  eliminar(requisito: IRequisito){
    console.log(requisito)
    let url = '/requisitos/eliminar'
    let mensaje = '¿Deseas eliminar el requisito? Esta acción no se puede deshacer y el registro se eliminará del sistema. El proceso solo se completará si la épica no tiene registros relacionados.'  
    this.dialogConfirm.open(ModalConfirma, {
      width: '400px',
      data: {
        title: 'Confirmación',
        message: mensaje,
        confirmText: 'Sí',
        cancelText: 'No'
      }
    }).afterClosed().subscribe(resultado => {
      if (resultado) {
        let datosRequisitos = {
          id: requisito.id,
        }
        this.crearRequisito(url, datosRequisitos)
      }
    })
  }

  crearRequisito(url: string, datosForm: any = []){ 
    this.formularioRequisito.controls['id_epica'].setValue(this.id_epica || this.formulario.controls['id'].value)
    this.modalCargandoServicio.abrirModal(true);
    let datos = null
    if(Object.keys(datosForm).length > 0){
      datos = datosForm
    }else{
      datos = this.formularioRequisito.getRawValue();
    }       
    this.peticionServicio.peticion(url, datos, 'POST')
    .subscribe({
      next: (resp)=>{
        console.log(resp)
        if(resp.error == true){
          let mensajes = ""
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
          if(url == '/requisitos/crear'){
            this.requisitos = [resp.data, ...this.requisitos]
          }
          if(url == '/requisitos/editar'){
            let id = this.formularioRequisito.controls['id'].value
            let requisito = this.formularioRequisito.controls['requisito'].value
            this.requisitos.forEach(element => {
              if(element.id == id ){
                element.requisito = requisito
              }
            });
          }   
          if(url == '/requisitos/eliminar'){
            let id = datosForm.id

            this.requisitos = this.requisitos.filter(element => element.id !== id);
          }
          this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho', positionClass: 'toast-bottom-right' });
          setTimeout(()=>{            
            this.cancelar()
          }, 500)
        }
      },
      error: (error)=>{
        this.modalMensajeServicio.abrirModal({
          tipo: "error",
          titulo: "Error:",
          mensaje: error.error?.message ?? error.error?.mensaje ?? error.message ?? 'Se presentó un error en el servidor.'
        });
        this.modalCargandoServicio.abrirModal(false);
      },
      complete: ()=>{
        this.modalCargandoServicio.abrirModal(false);
      }
    })
  }

  cambiaMostrarFormTarea(){
    this.mostrarCrearEpica = !this.mostrarCrearEpica
    if(this.mostrarCrearEpica){
      this.tituloRequisitos = "Mostrar requisitos"
    }else{
      this.tituloRequisitos = "Ocultar requisitos"
    }
  }

  cancelar(){
    this.labelBoton = "Agregar"
    this.formularioRequisito.controls['requisito'].setValue('')
  }

}