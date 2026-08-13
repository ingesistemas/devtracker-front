import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from "./components/shared/footer/footer";
import { Horizontal } from "./components/shared/horizontal/horizontal";
import { ModalMessage } from "./components/shared/modal-message/modal-message";
import { ModalCargando } from "./components/shared/modal-cargando/modal-cargando";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Horizontal, Footer, ModalMessage, ModalCargando],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('front');
}
