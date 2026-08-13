import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faCheckCircle, faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { DatosServicio } from '../../../servicios/datos-servicio';
import { ModalCargandoServicio } from '../../../servicios/modal-cargando-servicio';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Admin } from "../vertical/admin/admin";

@Component({
  selector: 'app-horizontal',
  imports: [FontAwesomeModule, RouterLink, Admin],
  templateUrl: './horizontal.html',
  styleUrl: './horizontal.css',
})
export class Horizontal  {
 private datosTempServicio = inject(DatosServicio)
 private modalCargandoServicio = inject(ModalCargandoServicio)
 private router = inject(Router)
  private toastrServicio = inject(ToastrService);
  
  faCheckCircle = faCheckCircle;
  faCodeBranch = faCodeBranch;
  faBars = faBars;
  emailUsuario = this.datosTempServicio.email
  idRolUsuario = this.datosTempServicio.id_rol

  
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
