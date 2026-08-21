import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IUsuario } from '../../../interfaces/iusuario';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popover',
  imports: [CommonModule, OverlayModule],
  templateUrl: './popover.html',
  styleUrl: './popover.css',
})
export class Popover {
  // Inputs requeridos para controlar la vista y datos
  @Input() isOpen = false;
  @Input() trigger!: CdkOverlayOrigin;
  @Input() user: IUsuario | null = null;

  // Evento para avisar al padre cuando se debe cerrar
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
