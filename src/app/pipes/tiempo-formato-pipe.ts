import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoFormato',
  standalone: true
})
export class TiempoFormatoPipe implements PipeTransform {
  transform(minutosTotales: number | null | undefined): string {
    if (minutosTotales == null || isNaN(minutosTotales)) return '0Hrs 0Min';

    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;

    if (horas === 0) {
      return `${minutos}Min`;
    }

    return `${horas}Hrs ${minutos}Min`;
  }
}