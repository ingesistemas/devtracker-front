import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { IRol } from '../../../interfaces/irol';
import { MatSelectModule } from '@angular/material/select';
import { IUsuario } from '../../../interfaces/iusuario';
import fa from '@angular/common/locales/fa';
import { IProyecto } from '../../../interfaces/iproyecto';
import { IEpica } from '../../../interfaces/iepica';
import { forkJoin } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-crear-epica',
  imports: [FontAwesomeModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, 
    RouterLink, MatSelectModule, NgClass],
  templateUrl: './crear-epica.html',
  styleUrl: './crear-epica.css',
})
export class CrearEpica {
  faCheck = faCheck;
  faCircleCheck = faCircleCheck
  faRotateLeft = faRotateLeft
  mostrarMensaje: boolean = false
  mensaje: string = ""
  proyectos: IProyecto[] = []
  epicas!: any
  usuarios!: any
  modoEdicion = false
  url: string = '/epicas/crear'
  titulo: string = 'Crear épica'
  private fb = inject(FormBuilder)
  private toastrServicio = inject(ToastrService)
  private obtenerErrorServicio = inject(ObtenerErrorServicio)
  private peticionServicio = inject(PeticionServicio)
  private modalMensajeServicio = inject(ModalMensajeServicio)
  private datosServicio = inject(DatosServicio)
  private modalCargandoServicio = inject(ModalCargandoServicio)
  private authService = inject(AuthServiceTs);
  private router = inject(Router)
  private datosTempServicio = inject(DatosServicio)

  formulario = this.fb.group({
    id: [0],
    nombre: ['', [Validators.required]],
    detalle: ['', [Validators.required]],
    id_proyecto: ['', [Validators.required]],
    id_usu_asig: ['', [Validators.required]],
    id_prioridad: ['', [Validators.required]],
    id_usu_creo: [this.datosTempServicio.id()]
  });

   listaPrioridades = [
    { id: 1, nombre: 'Crítica' },
    { id: 2, nombre: 'Alta' },
    { id: 3, nombre: 'Media' },
    { id: 4, nombre: 'Baja' }
  ];

  ngOnInit(): void {
    this.modalCargandoServicio.abrirModal(true);

    // forkJoin ejecuta ambas peticiones y espera a que terminen las dos
    forkJoin({
      proyectos: this.peticionServicio.peticion('/proyectos/consultar', null, 'GET'),
      usuarios: this.peticionServicio.peticion('/usuarios/consultar', null, 'GET')
    }).subscribe({
      next: (resp: any) => {
        // Validar respuesta de proyectos
        if (resp.proyectos.error) {
          this.modalMensajeServicio.abrirModal({
            tipo: 'error',
            titulo: 'Error:',
            mensaje: resp.proyectos.mensaje
          });
          return;
        }

        // Validar respuesta de usuarios
        if (resp.usuarios.error) {
          this.modalMensajeServicio.abrirModal({
            tipo: 'error',
            titulo: 'Error:',
            mensaje: resp.usuarios.mensaje
          });
          return;
        }

        // Asignar los catálogos
        this.proyectos = resp.proyectos.datos;
        this.usuarios = resp.usuarios.datos;

        // Recuperar estado para edición
        const state = globalThis?.history?.state;
        this.epicas = state?.datos;

        if (this.epicas) {
          this.modoEdicion = true;
          this.formulario.patchValue({
            id: this.epicas.id,
            nombre: this.epicas.nombre,
            detalle: this.epicas.detalle,
            id_proyecto: this.epicas.proyecto?.id ?? null,
            id_usu_asig: this.epicas.usuario_asignado?.id ?? null,
            id_prioridad: this.epicas.id_prioridad?.id ?? null
          });
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
    if (control && (control.touched || control.dirty) && control.invalid) {
      return this.obtenerErrorServicio.getErrores(this.formulario, campo);
    }
    return null;
  }

  aceptar() {
    this.modalCargandoServicio.abrirModal(true)
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched()
      this.modalCargandoServicio.abrirModal(false)
      this.modalMensajeServicio.abrirModal({
        "mensaje": "Se presentaron errores al validar los datos. Favor verificar.",
        "titulo": "Error:",
        "tipo": "error"
      })
      return
    }
    
    let datos = this.formulario.value
    this.peticionServicio.peticion(this.url, datos, 'POST')
    .subscribe({
      next: (resp) => {
        console.log(resp)
        let mensajes = ""
        if (resp.error) {
          if (resp.errores) {
            mensajes = Object.values(resp.errores)
              .flat()
              .join('\n');
          } else {
            mensajes = resp.mensaje
          }
          
          this.modalMensajeServicio.abrirModal({
            "tipo": "error",
            "titulo": "Error:",
            "mensaje": mensajes
          })
        } else {
          this.modalCargandoServicio.abrirModal(true)
          
          this.modalCargandoServicio.abrirModal(false)
          this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' })
          setTimeout(()=>{
            this.router.navigateByUrl("/epicas")
          }, 1000)
        }
      },
      error: (error)=>{
        this.modalMensajeServicio.abrirModal({
          "tipo": "error",
          "titulo": "Error:",
          "mensaje": error.error?.message ?? error.error?.mensaje ?? error.message ?? 'Se presentó un error en el servidor.'
        })
        this.modalCargandoServicio.abrirModal(false)
      },
      complete: ()=>{
        this.modalCargandoServicio.abrirModal(false)
      }
    }) 
  }
}
