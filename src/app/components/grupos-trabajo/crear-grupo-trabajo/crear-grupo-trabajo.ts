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
import { IGruposTrabajo } from '../../../interfaces/igrupos-trabajo';
import { IUsuario } from '../../../interfaces/iusuario';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-crear-grupo-trabajo',
  imports: [FontAwesomeModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, 
    RouterLink, MatSelectModule, NgClass],
  templateUrl: './crear-grupo-trabajo.html',
  styleUrl: './crear-grupo-trabajo.css',
})
export class CrearGrupoTrabajo {
  faCheck = faCheck;
  faCircleCheck = faCircleCheck
  faRotateLeft = faRotateLeft
  mostrarMensaje: boolean = false
  mensaje: string = ""
  modoEdicion = false
  url: string = '/grupos/crear'
  tituloFormulario: string = 'Crear grupo de trabajo'
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
  grupo!: IGruposTrabajo
  usuarios: IUsuario[] = []

  formulario = this.fb.group({
    id: [0],
    grupo: ['', [Validators.required]],
    detalle: ['', [Validators.required]],
    id_jefe: [null as number | null, [Validators.required]],
    id_usu_creo: [this.datosTempServicio.id()]
  });

  ngOnInit(): void {
    const state = globalThis?.history?.state;
    this.grupo =state?.datos;
   
    if (this.grupo) {
      this.formulario.patchValue({
        id: this.grupo.id,
        grupo: this.grupo.grupo,
        detalle: this.grupo.detalle,
        id_jefe: this.grupo.jefe.id
      });
      this.tituloFormulario = "Editar grupo de trabajo"
      this.url = '/grupos/editar'
    }
    
    this.cargarUsuarios()
  }

  validar(campo: string) {
    const control = this.formulario.get(campo);
    if (control && (control.touched || control.dirty) && control.invalid) {
      return this.obtenerErrorServicio.getErrores(this.formulario, campo);
    }
    return null;
  }

  cargarUsuarios(){
    this.peticionServicio.peticion('/usuarios/consultar', null, 'GET')
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
          this.modalCargandoServicio.abrirModal(true)
          
          this.modalCargandoServicio.abrirModal(false)
          this.usuarios = resp.datos
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
            this.router.navigateByUrl("/grupos")
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
