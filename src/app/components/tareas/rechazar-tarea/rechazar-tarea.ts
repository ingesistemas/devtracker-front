import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { faCheck, faCircleCheck, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
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
    MatSelectModule
  ],
  templateUrl: './rechazar-tarea.html',
  styleUrl: './rechazar-tarea.css',
})
export class RechazarTarea implements OnInit {
  faCheck = faCheck;
  faCircleCheck = faCircleCheck;
  faRotateLeft = faRotateLeft;
  mostrarMensaje: boolean = false;
  mensaje: string = "";
  proyectos: IProyecto[] = [];
  tareas!: any;
  usuarios!: any;
  modoEdicion = false;
  url: string = '/tareas/crear-rechazo';
  titulo: string = '';
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
  private datosTempServicio = inject(DatosServicio);
  accion: string = ''
  tarea: string = ''
  titulo2: string = ''

  formulario = this.fb.group({
    id: [0],
    detalle: ['', [Validators.required]],
    id_estado: [0],
    id_tarea: [0],
    archivo_pdf: new FormControl<File | null>(null),
    archivo_video: new FormControl<File | null>(null),
    id_usuario: [this.datosTempServicio.id()],
  });

  listaPrioridades = [
    { id: 4, nombre: 'Crítica' },
    { id: 3, nombre: 'Alta' },
    { id: 2, nombre: 'Media' },
    { id: 1, nombre: 'Baja' }
  ];

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
        this.tareas = state?.datos;
        if (this.tareas) {
          this.modoEdicion = true;
          this.formulario.patchValue({
            id_tarea: this.tareas.id,
            detalle: this.tareas.detalle ?? '',
            id_estado: this.tareas.id_estado
          });
          this.accion = this.tareas.accion ?? this.accion;
          if (this.accion === 'consultar') {
            this.formulario.get('detalle')?.disable();
          } else {
            this.formulario.get('detalle')?.enable();
          }
          this.tarea = this.tareas.tarea
          
          // Mostrar el nombre o la ruta existente si viene en los datos
          if (this.tareas.ruta_pdf) {
            this.archivoPdfNombre = this.tareas.ruta_pdf.split('/').pop() ?? 'Archivo adjunto';
          }
          this.titulo2 = 'Justificación para envío a QA'
          this.url = '/tareas/crear-rechazo';
          if(this.tareas.id_estado == "4"){
            this.titulo = 'Justificación'
          } else {
            this.titulo = 'Causa del rechazo';
            this.titulo2 = 'Justificación causa del rechazo.'
          }

        } else {
          if(this.tareas.id_estado == "4"){
            this.titulo = 'Detalle observaciones de pruebas.'

          } else {
            this.titulo = 'Justificación causa del rechazo';
            
          }
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

    formData.forEach((value, key) => {
    
    });

    this.peticionServicio.peticion(this.url, formData, 'POST')
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
          setTimeout(() => {
            if(this.tareas.id_estado == "4"){
              this.router.navigateByUrl("/crear-programa-epica")
            } else {
              this.router.navigateByUrl("/listar-qa")
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

  cancelar(){
    let ruta_origen = this.tareas.ruta_origen
    this.router.navigateByUrl(ruta_origen)
  }

}