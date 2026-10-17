import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { faMagnifyingGlass, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalHistorialServicio } from '../../../servicios/modal-historial-servicio';
import { ITarea } from '../../../interfaces/itarea';
import { Router } from '@angular/router';
import { ModalMensajeServicio } from '../../../servicios/modal-mensaje-servicio';

@Component({
  selector: 'app-modal-historial',
  imports: [FontAwesomeModule, CommonModule],
  templateUrl: './modal-historial.html',
  styleUrl: './modal-historial.css',
})
export class ModalHistorial implements OnInit {
  faRotateLeft = faRotateLeft
  faMagnifyingGlass = faMagnifyingGlass
  @Input() isVisible: boolean = false;
  @Input() mensaje: string = '';
  data: any = null
  private modalHistorialServicio = inject(ModalHistorialServicio)
  private router = inject(Router)
  private modalMensajeServicio = inject(ModalMensajeServicio)
  historial:any[] = []
  constructor() {
    
  }

  ngOnInit() {
    this.modalHistorialServicio.modalState$.subscribe(res => {
      this.data = res;
      if(res){
        this.historial = res.historiales
      }
    
    });
  }

  cerrar() {
    this.modalHistorialServicio.cerrarModal();
  }

  consultarHistorial(tarea: ITarea | any){
    let origen = (this.data as any).ruta_origen
      this.modalHistorialServicio.cerrarModal()
      let datos = {
        'id': tarea.id_tarea,
        'detalle': tarea.detalle,
        'ruta_pdf': tarea.url_pdf,
        'ruta_video': tarea.url_video,
        'accion': 'consultar',
        'ruta_origen': origen

      }

      this.router.navigate(['/crear-rechazo'], {
        state: { datos: datos }
      })
     
  }
}
