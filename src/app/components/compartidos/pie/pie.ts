import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-pie',
  imports: [FontAwesomeModule],
  templateUrl: './pie.html',
  styleUrl: './pie.css',
})
export class Pie {
  faCodeBranch = faCodeBranch;
}
