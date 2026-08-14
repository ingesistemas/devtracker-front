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
import { LowerCasePipe } from '@angular/common';

@Component({
  selector: 'app-datos-personales',
  imports: [FontAwesomeModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, RouterLink, MatSelectModule],
  templateUrl: './datos-personales.html',
  styleUrl: './datos-personales.css',
})
export class DatosPersonales {
  faCheck = faCheck;
  faCircleCheck = faCircleCheck
  faRotateLeft = faRotateLeft
  mostrarMensaje: boolean = false
  mensaje: string = ""
  roles: IRol[] = []
  usuarios!: any;
  modoEdicion = false
  titulo: string = 'Editar datos personales'
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
    id: [this.datosTempServicio.id()],
    email: ['', [Validators.required, Validators.email]],
    nombre: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.modalCargandoServicio.abrirModal(true)
    let datos = this.formulario.value
    console.log(datos)
    this.peticionServicio.peticion('/usuarios/consultar-personales', datos, 'POST')
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
        
          this.usuarios = resp.datos;        
          if (this.usuarios) {
            console.log(this.usuarios)
            this.modoEdicion = true
            this.formulario.patchValue({
              email: this.usuarios.email,
              nombre: this.usuarios.nombre
            })
          } 
        }
          this.modalCargandoServicio.abrirModal(false)
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


  validar(campo: string) {
    const control = this.formulario.get(campo);
    if (control && (control.touched || control.dirty) && control.invalid) {
      return this.obtenerErrorServicio.getErrores(this.formulario, campo);
    }
    return null;
  }

  aceptar() {
    this.modalCargandoServicio.abrirModal(true)
    let mEmail = this.formulario.controls['email'].value?.toLocaleLowerCase()!
    this.formulario.controls['email'].setValue(mEmail)
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
    this.peticionServicio.peticion('/usuarios/editar-personales', datos, 'POST')
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
          this.datosTempServicio.clear()
          this.modalCargandoServicio.abrirModal(false)
            this.toastrServicio.success('La sesión fue cerrada con éxito.', "Aviso:", { toastClass: 'ngx-toastr toast-ancho' })
          setTimeout(()=>{
            this.router.navigateByUrl("/")
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
