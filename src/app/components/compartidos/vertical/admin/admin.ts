import { Component, inject, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFlag } from '@fortawesome/free-regular-svg-icons';
import { faAward, faChartLine, faClipboardList, faPeopleCarryBox, faTimeline, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Router, RouterLink } from "@angular/router";
import { DatosServicio } from '../../../../servicios/datos-servicio';

@Component({
  selector: 'app-admin',
  imports: [FontAwesomeModule, MatButtonModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  faFlag = faFlag;
  faUsers = faUsers;
  faClipboardList = faClipboardList;
  faAward = faAward;
  faChartLine = faChartLine;
  faPeopleCarryBox = faPeopleCarryBox;
  private router = inject(Router)
  private datosTempServicio = inject(DatosServicio)

  openBottomSheet(){}

  trazabilidad(){
    this.router.navigate(['/epicas/'] )
  }

  programar(){
    this.router.navigate(['/programar/'] )
  }
}
