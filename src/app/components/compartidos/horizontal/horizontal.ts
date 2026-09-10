import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faCheckCircle, faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { DatosServicio } from '../../../servicios/datos-servicio';
import { ModalCargandoServicio } from '../../../servicios/modal-cargando-servicio';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Admin } from "../vertical/admin/admin";
import { TareaCronometroServicio } from '../../../servicios/tarea-cronometro-servicio';
import { NgClass } from '@angular/common';
import { CronometroServicio } from '../../../servicios/cronometro-servicio';

@Component({
  selector: 'app-horizontal',
  imports: [FontAwesomeModule, RouterLink, Admin, NgClass],
  templateUrl: './horizontal.html',
  styleUrl: './horizontal.css',
})
export class Horizontal  {
  private datosTempServicio = inject(DatosServicio)
  private modalCargandoServicio = inject(ModalCargandoServicio)
  private router = inject(Router)
  private toastrServicio = inject(ToastrService);
  private tareaCronometroServicio = inject(TareaCronometroServicio)
  private cronometroServicio = inject(CronometroServicio)
  
  faCheckCircle = faCheckCircle;
  faCodeBranch = faCodeBranch;
  faBars = faBars;
  emailUsuario = this.datosTempServicio.email
  idRolUsuario = this.datosTempServicio.id_rol
  tareaActual = this.tareaCronometroServicio.tarea
  horas = this.cronometroServicio.horaActual
  minutos = this.cronometroServicio.minutoActual
  
  clear(){
    this.modalCargandoServicio.abrirModal(true)
    this.datosTempServicio.clear()
    setTimeout(()=>{
      this.modalCargandoServicio.abrirModal(false)
      this.router.navigateByUrl("/")
      this.toastrServicio.success('La sesión fue cerrada con éxito.', "Aviso:", { toastClass: 'ngx-toastr toast-ancho' })
    }, 1000)
  }

}
