import { Component, Input } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-load',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './load.component.html',
  styleUrl: './load.component.css'
})
export class LoadComponent {
  @Input() isLoading: boolean = false;
  @Input() loadingMessage: string = 'Loading exam';
  @Input() showProgress: boolean = false;
  @Input() progress: number = 0;

}
