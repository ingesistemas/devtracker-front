import { Component, inject, Input } from '@angular/core';
import { ModalCargandoServicio } from '../../../servicios/modal-cargando-servicio';

@Component({
  selector: 'app-spinner-modal',
  standalone: true,
  templateUrl: './modal-cargando.html',
  styleUrl: './modal-cargando.css'
})
export class ModalCargando {
  private modalCargandoServicio = inject(ModalCargandoServicio)
  @Input() isVisible: boolean = false;
  @Input() mensaje: string = 'Procesando...';
  opcion: any

  ngOnInit() {
    this.modalCargandoServicio.modalState$.subscribe(res => {
      this.opcion = res;
    });
  }

  cerrar() {
    this.modalCargandoServicio.cerrarModal();
  }
}


