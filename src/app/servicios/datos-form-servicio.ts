import { computed, inject, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DatosFormServicio {
  private _datosForm = signal<any>(null)

  // 👀 lectura segura
  datos = this._datosForm.asReadonly()

  // 👀 Señal derivada: devuelve true si hay datos válidos, false si es null/undefined/vacío
  tieneDatos = computed(() => {
    const val = this._datosForm();
    if (!val) return false;
    // Si tus datos son un objeto, verifica que tenga al menos una propiedad
    return typeof val === 'object' ? Object.keys(val).length > 0 : true;
  });

  setDatosForm(datos: any) {
    this._datosForm.set(datos)
  }

  clear() {
    this._datosForm.set(null);
    localStorage.removeItem('datosFormulario');
  }
}
