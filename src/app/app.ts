import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Pie } from "./components/compartidos/pie/pie";
import { Horizontal } from "./components/compartidos/horizontal/horizontal";
import { ModalMensaje } from "./components/compartidos/modal-mensaje/modal-mensaje";
import { ModalCargando } from "./components/compartidos/modal-cargando/modal-cargando";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Horizontal, Pie, ModalMensaje, ModalCargando],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('front');
}
