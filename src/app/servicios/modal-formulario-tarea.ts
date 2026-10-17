import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalFormularioTareaServicio {
  private modalState = new BehaviorSubject<any>(null);
  private edicion = new BehaviorSubject<any>(false);
  
  modalState$ = this.modalState.asObservable();
  edicion$ = this.edicion.asObservable();
  private callback: (() => void) | null = null;

  abrirModal(data: any, edicion: boolean, callback?: () => void) {
    this.callback = callback || null;
    this.edicion.next(edicion)
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
