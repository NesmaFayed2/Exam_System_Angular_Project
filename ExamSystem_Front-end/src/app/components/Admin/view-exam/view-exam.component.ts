import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

import { AdminExamService } from '../../../services/admin-exam.service';
import { LoadComponent } from '../../../shared/load/load.component';

interface ExamDetails {
  _id: string;
  title: string;
  description: string;
  major: {
    name: string;
    description: string;
  };
  duration: number;
  total_marks: number;
  passing_marks: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_by: {
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-view-exam',
  standalone: true,
  imports: [LoadComponent, CommonModule, DatePipe],
  templateUrl: './view-exam.component.html',
  styleUrls: ['./view-exam.component.css'],
})
export class ViewExamComponent implements OnInit, OnDestroy {
  exam: ExamDetails | undefined;
  questions: any[] = [];
  isLoading = false;
  errorMessage = '';
  showDeleteModal = false;
  private questionToDelete: string | null = null;

  private examId: string | null = null;
  private examSubscription?: Subscription;
  private questionsSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminExamService: AdminExamService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.examId = params.get('id');
      if (this.examId) {
        this.loadExamDetails();
        this.loadExamQuestions();
      } else {
        this.router.navigate(['/admin/examlist']);
      }
    });
  }

  openDeleteQuestionModal(questionId: string): void {
    this.questionToDelete = questionId;
    this.showDeleteModal = true;
    document.body.classList.add('modal-open'); // Prevent background scrolling
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.questionToDelete = null;
    document.body.classList.remove('modal-open'); // Re-enable scrolling
  }

  confirmDeleteQuestion(): void {
    if (!this.questionToDelete) return;

    this.adminExamService.deleteQuestion(this.questionToDelete).subscribe({
      next: () => {
        this.questions = this.questions.filter(
          (q) => q._id !== this.questionToDelete
        );
        this.closeDeleteModal();
      },
      error: (error) => {
        this.errorMessage =
          'Failed to delete question: ' + (error.message || error);
        this.closeDeleteModal();
      },
    });
  }

  get canEditExam(): boolean {
    return this.examStatus !== 'Inactive' && this.examStatus !== 'Ended';
  }

  get examStatus(): string {
    if (!this.exam) return 'Unknown';

    const now = new Date();
    const startDate = new Date(this.exam.start_date);
    const endDate = new Date(this.exam.end_date);

    if (!this.exam.is_active) return 'Inactive';
    if (now < startDate) return 'Upcoming';
    if (now >= startDate && now <= endDate) return 'Active';
    return 'Ended';
  }

  get examStatusClass(): string {
    switch (this.examStatus) {
      case 'Active':
        return 'bg-success';
      case 'Upcoming':
        return 'bg-warning ';
      case 'Ended':
        return 'bg-secondary';
      case 'Inactive':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  private loadExamDetails(): void {
    if (!this.examId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.examSubscription = this.adminExamService
      .getExamById(this.examId)
      .subscribe({
        next: (examData: ExamDetails) => {
          this.exam = examData;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load exam details.';
          this.router.navigate(['/admin/examlist']);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  private loadExamQuestions(): void {
    if (!this.examId) return;

    this.questionsSubscription = this.adminExamService
      .getExamQuestions(this.examId)
      .subscribe({
        next: (questions: any[]) => {
          this.questions = questions;
        },
        error: (error) => {
          console.error('Error loading questions:', error);
        },
      });
  }

  editExam(): void {
    if (this.examId) {
      this.router.navigate(['/admin/exam-questions', this.examId]);
    }
  }

  addQuestion(): void {
    if (this.examId) {
      this.router.navigate(['/admin/exam-questions', this.examId]);
    }
  }

  viewExamResults(): void {
    if (this.examId) {
      this.router.navigate(['/admin/exam-results', this.examId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/examlist']);
  }

  ngOnDestroy(): void {
    this.examSubscription?.unsubscribe();
    this.questionsSubscription?.unsubscribe();
    document.body.classList.remove('modal-open'); // Cleanup in case modal was open
  }
}
