import { computed, inject, Injectable, signal } from '@angular/core';



@Injectable({
  providedIn: 'root',
})
export class TareaCronometroServicio {
  private _tarea = signal<any>(null)
  private _horas = signal<any>(0)
  private _minutos = signal<any>(0)

  // 👀 lectura segura
  tareaCronometroActual = this._tarea.asReadonly()

  // 👀 Señal derivada: devuelve true si hay datos válidos, false si es null/undefined/vacío
  tieneDatos = computed(() => {
    const val = this._tarea(); 
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') {
      return val.trim().length > 0;
    }
    return Boolean(val);
  });
  tarea = computed(() => this._tarea()?? null)
  horas = computed(() => this._horas() ?? 0)
  minutos = computed(() => this._minutos() ?? 0)
  
  setTiempo(horas: number, minutos: number){
    this._horas.set(horas)
    this._minutos.set(minutos)
  }

  setTarea(nombreTarea: any) {
    if(nombreTarea == ''){
      nombreTarea = 'No tienes ninguna tarea activa'
    }
    this._tarea.set(nombreTarea)
  }

  clear() {
    this._tarea.set(null);
    localStorage.removeItem('datosFormulario');
  }
}
