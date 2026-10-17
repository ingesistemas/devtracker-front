import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-modal-confirma',
  imports: [MatButtonModule, MatDialogContent, MatDialogActions],
  templateUrl: './modal-confirma.html',
  styleUrl: './modal-confirma.css',
})
export class ModalConfirma {
  constructor(
    public dialogRef: MatDialogRef<ModalConfirma>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
