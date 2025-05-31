import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminExamService } from '../../../services/admin-exam.service'; // Updated import
import { Subscription } from 'rxjs';

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
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './view-exam.component.html',
  styleUrls: ['./view-exam.component.css'],
})
export class ViewExamComponent implements OnInit, OnDestroy {
  exam: ExamDetails | undefined;
  questions: any[] = [];
  isLoading = false;
  errorMessage = '';

  private examId: string | null = null;
  private examSubscription: Subscription | undefined;
  private questionsSubscription: Subscription | undefined;

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
        console.error('No valid exam ID provided in route.');
        this.router.navigate(['/admin/examlist']);
      }
    });
  }

  loadExamDetails(): void {
    if (!this.examId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.examSubscription = this.adminExamService
      .getExamById(this.examId)
      .subscribe({
        next: (examData: ExamDetails) => {
          this.exam = examData;
          console.log('Exam details loaded:', this.exam);
        },
        error: (error) => {
          console.error('Error fetching exam details:', error);
          this.errorMessage = error;
          this.router.navigate(['/admin/examlist']);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  loadExamQuestions(): void {
    if (!this.examId) return;

    this.questionsSubscription = this.adminExamService
      .getExamQuestions(this.examId)
      .subscribe({
        next: (questions: any[]) => {
          this.questions = questions;
          console.log('Questions loaded:', this.questions);
        },
        error: (error) => {
          console.error('Error fetching questions:', error);
        },
      });
  }

  editExam(): void {
    if (this.examId) {
      this.router.navigate(['/admin/exam-questions', this.examId]);
    }
  }

  deleteExam(): void {
    if (!this.examId) return;

    if (
      confirm(
        'Are you sure you want to delete this exam? This action cannot be undone.'
      )
    ) {
      this.adminExamService.deleteExam(this.examId).subscribe({
        next: () => {
          console.log('Exam deleted successfully');
          this.router.navigate(['/admin/examlist']);
        },
        error: (error) => {
          console.error('Error deleting exam:', error);
          alert('Error deleting exam: ' + error);
        },
      });
    }
  }

  addQuestion(): void {
    if (this.examId) {
      this.router.navigate(['/admin/add-question', this.examId]);
    }
  }

  editQuestion(questionId: string): void {
    this.router.navigate(['/admin/edit-question', questionId]);
  }

  deleteQuestion(questionId: string): void {
    if (confirm('Are you sure you want to delete this question?')) {
      this.adminExamService.deleteQuestion(questionId).subscribe({
        next: () => {
          this.questions = this.questions.filter((q) => q._id !== questionId);
          console.log('Question deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting question:', error);
          alert('Error deleting question: ' + error);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/examlist']);
  }

  // Helper methods for template
  get questionsCount(): number {
    return this.questions.length;
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
    const status = this.examStatus;
    switch (status) {
      case 'Active':
        return 'bg-success';
      case 'Upcoming':
        return 'bg-warning';
      case 'Ended':
        return 'bg-secondary';
      case 'Inactive':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  trackQuestionById(index: number, question: any): string {
    return question._id;
  }

  trackOptionById(index: number, option: any): string {
    return option.option_label;
  }

  ngOnDestroy(): void {
    this.examSubscription?.unsubscribe();
    this.questionsSubscription?.unsubscribe();
  }
}
