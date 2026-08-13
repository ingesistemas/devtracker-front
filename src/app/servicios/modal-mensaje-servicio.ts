import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalMensajeServicio {
  private modalState = new BehaviorSubject<any>(null);
  modalState$ = this.modalState.asObservable();
  private callback: (() => void) | null = null;

  abrirModal(data: any, callback?: () => void) {
    this.callback = callback || null;
    this.modalState.next(data);
  }

  cerrarModal() {
    this.modalState.next(null);

    if (this.callback) {
      this.callback();
      this.callback = null;
    }
  }
}
