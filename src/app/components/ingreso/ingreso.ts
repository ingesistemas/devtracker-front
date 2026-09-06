import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleCheck, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faCheck, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ObtenerErrorServicio } from '../../servicios/obtener-error-servicio';
import { PeticionServicio } from '../../servicios/peticion-servicio';
import { ModalMensajeServicio } from '../../servicios/modal-mensaje-servicio';
import { DatosServicio } from '../../servicios/datos-servicio';
import { ModalCargandoServicio } from '../../servicios/modal-cargando-servicio';
import { AuthServiceTs } from '../../servicios/auth.service';
import { TareaCronometroServicio } from '../../servicios/tarea-cronometro-servicio';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-ingreso',
  imports: [FontAwesomeModule, RouterLink, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './ingreso.html',
  styleUrl: './ingreso.css',
})

export class Ingreso {
  mostrarContrasena = false;
  faEye = faEye;
faEyeSlash = faEyeSlash;
  faCheck = faCheck;
  faCircleCheck = faCircleCheck
  faRotateLeft = faRotateLeft
  mostrarMensaje: boolean = false
  mensaje: string = ""
  private fb = inject(FormBuilder)
  private toastrServicio = inject(ToastrService)
  private obtenerErrorServicio = inject(ObtenerErrorServicio)
  private peticionServicio = inject(PeticionServicio)
  private modalMensajeServicio = inject(ModalMensajeServicio)
  private datosServicio = inject(DatosServicio)
  private modalCargandoServicio = inject(ModalCargandoServicio)
  private authService = inject(AuthServiceTs);
  private router = inject(Router)
  private tareaCronometroServicio = inject(TareaCronometroServicio)

  formulario = this.fb.group({
    email: ['ingesistemas@gmail.com', [Validators.required, Validators.email]],
    contrasena: ['123456', [Validators.required]],
  });


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
    } else {
      let datos = this.formulario.value

      this.peticionServicio.peticion('/usuarios/ingresar', datos, 'POST')
        .subscribe({
          next: (resp) => {
            console.log(resp)
    
            if (resp.error) {
              this.modalMensajeServicio.abrirModal({
                "tipo": "error",
                "titulo": "Error:",
                "mensaje": resp.mensaje
              })
            } else {
              this.authService.setToken(resp.token);
              this.datosServicio.setUser({
                id: resp.user.id,
                id_empresa: resp.user.id_empresa,
                email: resp.user.email,
                id_rol: resp.user.id_rol
              })
              let epicaActiva = (resp.user.epica_activa?.nombre ?? '').toUpperCase();
              let tareaActiva = resp.user.tarea_activa?.detalle ?? ''
              let actividad = ''
              if(tareaActiva != ''){
                actividad = epicaActiva + ' - ' + tareaActiva
              }
              
              this.tareaCronometroServicio.setTarea(actividad)
              this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' })
              this.router.navigateByUrl("/contenedor")
            }
             this.modalCargandoServicio.abrirModal(false)
          }
        }) 
    }

  }

}
