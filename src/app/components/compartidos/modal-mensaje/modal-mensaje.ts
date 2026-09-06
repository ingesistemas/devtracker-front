import { Component, inject, Input, OnInit } from '@angular/core';
import { ModalMensajeServicio } from '../../../servicios/modal-mensaje-servicio';
import { NgClass } from '@angular/common';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-modal-mensaje',
  imports: [NgClass, FontAwesomeModule],
  templateUrl: './modal-mensaje.html',
  styleUrl: './modal-mensaje.css',
})
export class ModalMensaje implements OnInit {
  faRotateLeft = faRotateLeft;
  @Input() isVisible: boolean = false;
  @Input() mensaje: string = '';
  data: any = null
  private modalMensajeServicio = inject(ModalMensajeServicio)

  constructor() {
    
  }

  ngOnInit() {
    this.modalMensajeServicio.modalState$.subscribe(res => {
      this.data = res;
    });
  }

  cerrar() {
    this.modalMensajeServicio.cerrarModal();
  }
}
