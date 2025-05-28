import { Component, Input } from '@angular/core';
import { Exam, StudentExam } from '../../../models/exam';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exam-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './exam-card.component.html',
  styleUrl: './exam-card.component.css',
})
export class ExamCardComponent {
  @Input() exam!: StudentExam;
}
