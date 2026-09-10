import { computed, inject, Injectable, signal } from '@angular/core';
import { TareaCronometroServicio } from './tarea-cronometro-servicio';
import { DatosFormServicio } from './datos-form-servicio';
import { DatosServicio } from './datos-servicio';

@Injectable({
  providedIn: 'root',
})
export class CronometroServicio {
  private _tarea = signal<any>(null);
  private _horasCronometro = signal<any>(0);
  private _minutosCronometro = signal<any>(0);
  private _estadoActivo = signal<boolean>(false);
  private _fec_ini = signal<any>(new Date());
  private _tiempo = signal<number>(0);
  private datosTemServicio = inject(DatosServicio)
  
  private tareaCronometroServicio = inject(TareaCronometroServicio);
  horas: number = 0;
  minutos: number = 0;

  tieneDatos = computed(() => {
    const val = this._tarea(); 
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') {
      return val.trim().length > 0;
    }
    return Boolean(val);
  });

  horaActual = computed(() => this._horasCronometro() ?? 0);
  minutoActual = computed(() => this._minutosCronometro() ?? 0);
  //estadoActivo = computed(() => this._estadoActivo());
  fecInicial = computed(() => this._fec_ini());
  tiempoInicial = computed(() => this._tiempo());

  /* setEstadoActivo(){
    this._estadoActivo.set(true);
  } */

  setActivo(fecha: any, tiempo: number){
    if(fecha == null){
      fecha = new Date()
    }

    if(tiempo == null){
      tiempo = 0
    }
    this._fec_ini.set(fecha);
    this._tiempo.set(tiempo);
  }
  
  setCronometro() {
    let fechaHoraInicio = this.fecInicial();
    let tiempo = this.tiempoInicial(); 
    let tareaActiva = this.tareaCronometroServicio.tarea();
    let minutosAcumulados = tiempo ?? 0;

    if (tareaActiva === 'No tienes ninguna tarea activa'){
      this._horasCronometro.set(0);
      this._minutosCronometro.set(0);
      return;
    }

    if (fechaHoraInicio == null){  
      let totalMinutos = minutosAcumulados;
      this.horas = Math.floor(totalMinutos / 60);
      this.minutos = totalMinutos % 60;
    } else {
      const fechaNormalizada = typeof fechaHoraInicio === 'string'
        ? fechaHoraInicio.trim().replace(' ', 'T')
        : fechaHoraInicio;

      const fechaInicio = new Date(fechaNormalizada);
      const ahora = new Date();
      const transcurridoMs = ahora.getTime() - fechaInicio.getTime();
      const transcurridoMin = Math.floor(transcurridoMs / 60000); // miliseg → minutos

      let totalMinutos = minutosAcumulados + transcurridoMin;
      this.horas = Math.floor(totalMinutos / 60);
      this.minutos = totalMinutos % 60;
    }
    
    this._horasCronometro.set(this.horas);
    this._minutosCronometro.set(this.minutos);
  }

  limpiarCronometro() {
    this.horas = 0;
    this.minutos = 0;
    this._horasCronometro.set(0);
    this._minutosCronometro.set(0);
  }
}