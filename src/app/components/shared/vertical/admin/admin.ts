import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFlag } from '@fortawesome/free-regular-svg-icons';
import { faAward, faChartLine, faClipboardList, faTimeline, faUsers } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from "@angular/router";

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

  openBottomSheet(){}
}
