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
import fa from '@angular/common/locales/fa';
import { IProyecto } from '../../../interfaces/iproyecto';

@Component({
  selector: 'app-crear-proyectos',
  imports: [FontAwesomeModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, RouterLink, MatSelectModule],
  templateUrl: './crear-proyectos.html',
  styleUrl: './crear-proyectos.css',
})
export class CrearProyectos {
    
  faCheck = faCheck;
  faCircleCheck = faCircleCheck
  faRotateLeft = faRotateLeft
  mostrarMensaje: boolean = false
  mensaje: string = ""
  modoEdicion = false
  url: string = '/proyectos/crear'
  tituloFormulario: string = 'Crear proyecto'
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
  proyecto!: IProyecto

  formulario = this.fb.group({
    id: [0],
    proyecto: ['', [Validators.required]],
    id_usuario: [this.datosTempServicio.id()]
  });

  ngOnInit(): void {
    const state = globalThis?.history?.state;
    this.proyecto =state?.datos;
   
    if (this.proyecto) {
      this.formulario.patchValue({
        id: this.proyecto.id,
        proyecto: this.proyecto.proyecto,
      });
      this.tituloFormulario = "Editar proyecto"
      this.url = '/proyectos/editar'
    }
    this.modalCargandoServicio.abrirModal(false)
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
    console.log(datos)
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
            this.router.navigateByUrl("/proyectos")
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
