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

@Component({
  selector: 'app-cambiar-contrasena',
  imports: [FontAwesomeModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, RouterLink, MatSelectModule],
  templateUrl: './cambiar-contrasena.html',
  styleUrl: './cambiar-contrasena.css',
})
export class CambiarContrasena {
  faCheck = faCheck;
  faCircleCheck = faCircleCheck
  faRotateLeft = faRotateLeft
  mostrarMensaje: boolean = false
  mensaje: string = ""
  roles: IRol[] = []
  usuarios!: any;
  modoEdicion = false
  titulo: string = 'Cambiar contraseña'
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
    contrasena: ['', [Validators.required, Validators.minLength(6)]],
    confirmar: ['', [Validators.required, Validators.minLength(6)]],
    nueva: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    this.peticionServicio.peticion('/roles/consultar', null, 'GET')
    .subscribe({
      next: (resp) => {
        if (resp.error) {
          this.modalMensajeServicio.abrirModal({
            "tipo": "error",
            "titulo": "Error:",
            "mensaje": resp.mensaje
          })
        } else {
          this.roles = resp.datos
          const state = globalThis?.history?.state;
          this.usuarios =state?.datos;
        
          if (this.usuarios) {
            this.modoEdicion = true
            this.formulario.patchValue({
              id: this.usuarios.id,
            })
          } 
        }
        this.modalCargandoServicio.abrirModal(false)
      },
      complete: ()=>{
         this.modalCargandoServicio.abrirModal(false)
      }
    })    
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
    
    if(this.formulario.controls['confirmar'].value != this.formulario.controls['nueva'].value ){
      this.modalMensajeServicio.abrirModal({
        "tipo": "error",
        "titulo": "Error:",
        "mensaje": 'Las contraseñas ingresadas no coinciden.'
      })
      this.modalCargandoServicio.abrirModal(false)
      return
    }
    
    let datos = this.formulario.value
    this.peticionServicio.peticion('/usuarios/editar-credenciales', datos, 'POST')
    .subscribe({
      next: (resp) => {
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
          this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' })
          
          this.modalCargandoServicio.abrirModal(true)
          this.datosTempServicio.clear()
          setTimeout(()=>{
            this.modalCargandoServicio.abrirModal(false)
            this.router.navigateByUrl("/")
            this.toastrServicio.success('La sesión fue cerrada con éxito.', "Aviso:", { toastClass: 'ngx-toastr toast-ancho' })
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
