import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalCargandoServicio {
  private modalState = new BehaviorSubject<any>(null);
  modalState$ = this.modalState.asObservable();
  private callback: (() => void) | null = null;

  abrirModal(opcion: boolean, callback?: () => void) {
    this.callback = callback || null;
    this.modalState.next(opcion);
  }

  cerrarModal() {
    this.modalState.next(null);

    if (this.callback) {
      this.callback();
      this.callback = null;
    }
  }
}
