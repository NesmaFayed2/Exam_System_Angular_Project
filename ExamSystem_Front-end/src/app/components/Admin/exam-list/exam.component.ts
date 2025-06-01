import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminExamService } from '../../../services/admin-exam.service'; // Updated import
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, DatePipe],
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.css'],
})
export class ExamListComponent implements OnInit, OnDestroy {
  exams: any[] = [];
  isLoading = false;
  errorMessage = '';
  examToDeleteId: string | null = null;
  showConfirmModal = false;

  private examsSubscription: Subscription | undefined;

  constructor(private adminExamService: AdminExamService) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.examsSubscription = this.adminExamService.getAllExams().subscribe({
      next: (data: any[]) => {
        this.exams = data.map((exam) => ({
          id: exam._id,
          title: exam.title,
          description: exam.description,
          startDate: exam.start_date,
          endDate: exam.end_date,
          duration: exam.duration,
          track: exam.major?.name || 'N/A',
          totalMarks: exam.total_marks,
          passingMarks: exam.passing_marks,
          isActive: exam.is_active,
        }));
        console.log('Exams loaded successfully:', this.exams);
      },
      error: (error) => {
        console.error('Error loading exams:', error);
        this.errorMessage = error;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
  confirmDelete(id: string): void {
    this.examToDeleteId = id;
    this.showConfirmModal = true;
  }
  cancelDelete(): void {
    this.examToDeleteId = null;
    this.showConfirmModal = false;
  }

  deleteExam(): void {
    if (this.examToDeleteId) {
      this.adminExamService.deleteExam(this.examToDeleteId).subscribe({
        next: () => {
          this.exams = this.exams.filter(
            (exam) => exam.id !== this.examToDeleteId
          );
          console.log(
            `Exam with ID ${this.examToDeleteId} deleted successfully.`
          );
        },
        error: (error) => {
          console.error(
            `Error deleting exam with ID ${this.examToDeleteId}:`,
            error
          );
          alert('Error deleting exam: ' + error);
        },
        complete: () => {
          this.showConfirmModal = false;
          this.examToDeleteId = null;
        },
      });
    }
  }

  trackById(index: number, exam: any): string {
    return exam.id;
  }

  ngOnDestroy(): void {
    this.examsSubscription?.unsubscribe();
  }
}
