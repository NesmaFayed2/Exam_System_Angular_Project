import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router'; 
import { CommonModule, DatePipe } from '@angular/common';// CommonModule for *ngIf, *ngFor, DatePipe for date formatting
import { HttpErrorResponse } from '@angular/common/http'; // For robust error handling
import { ExamService } from './../../../services/exam.service'; // Adjust path to your service
import { Exam } from './../../../models/exam'; // Adjust path to your model
import { Subscription } from 'rxjs'; // For managing subscriptions

@Component({
  selector: 'app-exam-list',
  standalone: true,
   imports: [CommonModule, RouterLink, RouterModule, DatePipe],
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.css'], // Link to the new CSS file
})
export class ExamListComponent implements OnInit, OnDestroy {
  exams: Exam[] = [];
  private examsSubscription: Subscription | undefined; // To manage the subscription

  constructor(private examService: ExamService) {}

  ngOnInit(): void {
    this.examsSubscription = this.examService.getAll().subscribe({
      next: (data: Exam[]) => {
        this.exams = data;
        console.log('Exams successfully fetched and displayed:', this.exams);
      },
      error: (err: HttpErrorResponse | Error) => {
        console.error('Error fetching exams for list:', err);
      },
    });
  }

  deleteExam(id: number): void {
    if (
      confirm(
        `Are you sure you want to delete exam with ID: ${id}? This action cannot be undone.`
      )
    ) {
      this.examService.delete(id).subscribe({
        next: () => {
          console.log(`Exam with ID ${id} deleted successfully.`);
        },
        error: (err: HttpErrorResponse | Error) => {
          console.error(`Error deleting exam with ID ${id}:`, err);
        },
      });
    }
  }

  trackById(index: number, exam: Exam): number {
    return exam.id;
  }

  ngOnDestroy(): void {
    if (this.examsSubscription) {
      this.examsSubscription.unsubscribe();
    }
  }
}
