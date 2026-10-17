import { computed, inject, Injectable, signal, OnDestroy } from '@angular/core';
import { TareaCronometroServicio } from './tarea-cronometro-servicio';
import { DatosFormServicio } from './datos-form-servicio';
import { DatosServicio } from './datos-servicio';
import { HttpClient } from '@angular/common/http';
import { PeticionServicio } from './peticion-servicio';

@Injectable({
  providedIn: 'root',
})
export class CronometroServicio implements OnDestroy {
  private _tiempoAcumulado = signal<number>(0);
  private _horaActual = signal<number>(0);
  private _minutoActual = signal<number>(0);
  private _fechaActiva = signal<Date | null>(null);

  private _intervalId: any = null;
  readonly minutosTranscurridos = signal<number>(0);
  private _id_tarea = signal<number>(0)
  private datosServicio = inject(DatosServicio)
  private peticionServicio = inject(PeticionServicio)
  private tareaServicio = inject(TareaCronometroServicio)

  tiempoAcumulado = computed(() => this._tiempoAcumulado());
  horaActual = computed(() => this._horaActual());
  minutoActual = computed(() => this._minutoActual());
  idtarea = computed(() => this._id_tarea());

  setActualizarDatos(id_tarea: number, tiempo: number, fec_ini: any){
    this._tiempoAcumulado.set(tiempo)
    let horas = Math.floor(tiempo / 60) + this.horaActual()
    let minutos = (tiempo % 60)
    this._horaActual.set(horas)
    this._minutoActual.set(minutos)
    this._fechaActiva.set(fec_ini)
    this._id_tarea.set(id_tarea)
  }

  setCronometro(){
    const fechaInicio = this._fechaActiva();
    const fecha = fechaInicio ? new Date(fechaInicio) : null;

    // Validamos si la fecha existe y si es válida
    if (!fecha || isNaN(fecha.getTime())) {
      this._tiempoAcumulado.set(0);
      this._horaActual.set(0);
      this._minutoActual.set(0);
      return;
    } 

    const ahora = new Date();
    //const diferenciaMs = ahora.getTime() - fecha.getTime();

    
    // Si diferenciaMs es negativa (ej. reloj del PC desfasado), aseguramos mínimo 0
    let acumulado = this.tiempoAcumulado() +  1;
    this._tiempoAcumulado.set(acumulado);
    let hora = Math.floor(acumulado / 60);
    this._horaActual.set(hora);
    this._minutoActual.set(acumulado % 60);
    this.minutosTranscurridos.update(min => min + 1);

    if (this.minutosTranscurridos() == 2) {
      this.hacerPeticionHttp();
      this.minutosTranscurridos.set(0); // Reiniciamos el contador
    }
    clearInterval(this._intervalId);
  }

  hacerPeticionHttp() {
    const tarea = this.tareaServicio.tarea()
    const datos = {
      id: this.idtarea(),
      id_usuario: this.datosServicio.id(),
      tarea: tarea
    };
   this.peticionServicio.peticion('/tareas/temporizador', datos, 'POST')
    .subscribe({
      next: (resp) => {
        
      }
    })
  }

  restaurar(){

  }

  ngOnDestroy(){

  }
}