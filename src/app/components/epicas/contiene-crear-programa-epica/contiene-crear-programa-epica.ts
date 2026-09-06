import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CrearProgramaEpica } from '../crear-programa-epica/crear-programa-epica';
import { DescribirProgramaEpica } from '../describir-programa-epica/describir-programa-epica';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalFormularioTarea } from "../../compartidos/modal-formulario-tarea/modal-formulario-tarea";

@Component({
  selector: 'app-contiene-crear-programa-epica',
  imports: [CommonModule, MatTabsModule, CrearProgramaEpica, DescribirProgramaEpica, ReactiveFormsModule, ModalFormularioTarea],
  templateUrl: './contiene-crear-programa-epica.html',
  styleUrl: './contiene-crear-programa-epica.css',
})
export class ContieneCrearProgramaEpica {

}
