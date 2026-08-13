import { computed, inject, Injectable, signal } from '@angular/core';



@Injectable({
  providedIn: 'root',
})
export class DatosServicio {
  

  private _user = signal<{
    id: number
    email: string
    id_empresa: number
    id_rol: number
  } | null>(null)

  // 👀 lectura segura
  user = this._user.asReadonly()

  // valores derivados
  id = computed(() => this._user()?.id ?? null)
  email = computed(() => this._user()?.email ?? null)
  id_empresa = computed(() => this._user()?.id_empresa ?? null)
  id_rol = computed(() => this._user()?.id_rol ?? null)

  //isAdmin = computed(() => this._user()?.roleId === 1);

  setUser(user: { id: number; email: string; id_empresa: number, id_rol: number }) {
    this._user.set(user)
  }

  clear() {
    this._user.set(null)
    localStorage.clear()
  }
}
