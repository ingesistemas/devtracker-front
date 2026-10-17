import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DatosTareasServicio {
  // Inicializamos el Signal preferentemente como un arreglo vacío para evitar nulls
  private _datosForm = signal<any[]>([]);
  private _idEstadoConsulta = signal<number>(0)
  private _nombreEstadoConsulta = signal<string>('')
  private _historial = signal<any[]>([])
  
  // Lectura segura
  datos = this._datosForm.asReadonly();
  idEstadoConsulta = this._idEstadoConsulta
  nombreEstadoConsulta = this._nombreEstadoConsulta
  historial = this._historial

  // Señal derivada para verificar si hay tareas
  tieneDatos = computed(() => {
    const val = this._datosForm();
    return Array.isArray(val) && val.length > 0;
  });

  setDatosForm(datos: any[]) {
    this._datosForm.set(datos || []);
  }

  setHistorial(datos: any){
    this.historial.set(datos)
  }

  setIdEstadoConsulta(id_estado: number, nombre: string){
    this._idEstadoConsulta.set(id_estado)
    this._nombreEstadoConsulta.set(nombre)
  }

  // Usamos .update() para agregar el nuevo elemento al inicio de forma inmutable
  agregarDatosForm(nuevaTarea: any) {
    this._datosForm.update((tareasActuales) => {
      const lista = Array.isArray(tareasActuales) ? tareasActuales : [];
      return [nuevaTarea, ...lista];
    });
  }

  actualizarDatosForm(tareaActualizada: any) {
    this._datosForm.update((tareasActuales) => {
      const lista = Array.isArray(tareasActuales) ? tareasActuales : [];
      return lista.map((tarea) =>
        tarea.id === tareaActualizada.id ? { ...tarea, ...tareaActualizada } : tarea
      );
    });
  }

  clear() {
    this._datosForm.set([]);
    localStorage.removeItem('datosFormulario');
  }
}