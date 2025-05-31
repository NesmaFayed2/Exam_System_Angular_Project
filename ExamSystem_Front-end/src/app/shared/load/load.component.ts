import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-load',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatIconModule],
  templateUrl: './load.component.html',
  styleUrl: './load.component.css'
})
export class LoadComponent {}
