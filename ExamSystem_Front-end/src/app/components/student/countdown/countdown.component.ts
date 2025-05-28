import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-countdown',
  imports: [CommonModule],
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.css'
})
export class CountdownComponent  implements OnChanges {
  @Input() timeLeft!: number;
  minutes = '00';
  seconds = '00';
  warning = false;
  danger = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['timeLeft']) {
      this.updateDisplay();
    }
  }

  updateDisplay() {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    
    this.minutes = mins.toString().padStart(2, '0');
    this.seconds = secs.toString().padStart(2, '0');
    
    this.warning = this.timeLeft <= 300 && this.timeLeft > 60; 
    this.danger = this.timeLeft <= 60; 
  }
}
