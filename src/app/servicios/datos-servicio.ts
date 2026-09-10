import { computed, inject, Injectable, signal } from '@angular/core';



@Injectable({
  providedIn: 'root',
})
export class DatosServicio {
  

  private _user = signal<{
    id: number
    email: string
    id_empresa: number
    id_rol: number,
    id_epica: number,
    id_tarea: number,
    fec_ini: any,
    tiempo: number
  } | null>(null)

  // 👀 lectura segura
  user = this._user.asReadonly()

  // valores derivados
  id = computed(() => this._user()?.id ?? null)
  email = computed(() => this._user()?.email ?? null)
  id_empresa = computed(() => this._user()?.id_empresa ?? null)
  id_rol = computed(() => this._user()?.id_rol ?? null)
  id_epica = computed(() => this._user()?.id_epica ?? null)
  id_tarea = computed(() => this._user()?.id_tarea ?? null)
  fec_ini = computed(() => this._user()?.fec_ini ?? null)
  tiempo = computed(() => this._user()?.tiempo ?? 0)

  //isAdmin = computed(() => this._user()?.roleId === 1);

  setUser(user: { id: number; email: string; id_empresa: number, id_rol: number, id_epica: number, id_tarea: number, fec_ini: any, tiempo: number }) {
    this._user.set(user)
  }

  setTareaActiva(id_tarea: number, fec_ini: any, tiempo: number) {
    this._user.update(currentUser => {
      if(fec_ini == null){
        fec_ini = new Date()
        fec_ini = fec_ini.toISOString()
      }

      if(tiempo == null){
        tiempo = 0
      }
      if (!currentUser) return null; // Si el usuario es null, se mantiene null

      return {
        ...currentUser,
        id_tarea,
        fec_ini,
        tiempo
      };
    });
  }
  
  setTiempoActivo(tiempo: number) {
    this._user.update(currentUser => {

      if(tiempo == null){
        tiempo = 0
      }
      if (!currentUser) return null; // Si el usuario es null, se mantiene null

      return {
        ...currentUser,
        tiempo
      };
    });
  }

  clear() {
    this._user.set(null)
    localStorage.clear()
  }
}
