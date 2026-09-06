import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DatosTareasServicio {
  // Inicializamos el Signal preferentemente como un arreglo vacío para evitar nulls
  private _datosForm = signal<any[]>([]);

  // Lectura segura
  datos = this._datosForm.asReadonly();

  // Señal derivada para verificar si hay tareas
  tieneDatos = computed(() => {
    const val = this._datosForm();
    return Array.isArray(val) && val.length > 0;
  });

  setDatosForm(datos: any[]) {
    this._datosForm.set(datos || []);
  }

  // Usamos .update() para agregar el nuevo elemento al inicio de forma inmutable
  agregarDatosForm(nuevaTarea: any) {
    this._datosForm.update((tareasActuales) => {
      const lista = Array.isArray(tareasActuales) ? tareasActuales : [];
      return [nuevaTarea, ...lista];
    });
  }

  clear() {
    this._datosForm.set([]);
    localStorage.removeItem('datosFormulario');
  }
}