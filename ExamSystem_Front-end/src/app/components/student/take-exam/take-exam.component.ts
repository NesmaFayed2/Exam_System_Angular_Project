import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentExamService } from '../../../services/exam.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CountdownComponent } from '../countdown/countdown.component';

interface Question {
  _id: string;
  question_text: string;
  options: {
    option_text: string;
    option_label: string;
  }[];
  marks: number;
  order: number;
}

interface ExamData {
  _id: string;
  title: string;
  description: string;
  duration: number;
  total_marks: number;
  major: any;
}

@Component({
  selector: 'app-take-exam',
  standalone: true,
  imports: [CountdownComponent, CommonModule, FormsModule],
  templateUrl: './take-exam.component.html',
  styleUrls: ['./take-exam.component.css'],
})
export class TakeExamComponent implements OnInit, OnDestroy {
  exam!: ExamData;
  questions: Question[] = [];
  answers: { [questionId: string]: string } = {};
  timeLeft: number = 0;
  timer: any;
  currentQuestionIndex = 0;
  submitted = false;
  isLoading = false;
  isSubmitting = false; // NEW: For submit spinner
  errorMessage = '';
  examStartTime: string = '';
  examResult: any = null;

  private examSubscription: Subscription | undefined;
  private submitSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentExamService: StudentExamService
  ) {}

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('id');
    if (examId) {
      this.loadExam(examId);
    } else {
      this.showError('Invalid exam ID provided.');
    }
  }

  loadExam(examId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.examSubscription = this.studentExamService
      .startExam(examId)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.exam = response.data.exam;
            this.questions = response.data.questions;
            this.questions.forEach((q) => (this.answers[q._id] = ''));
            this.timeLeft = this.exam.duration * 60;
            this.examStartTime = new Date().toISOString();
            this.startTimer();
          } else {
            this.showError('Failed to load exam.');
          }
        },
        error: (error) => {
          this.showError(error || 'An error occurred while loading the exam.');
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  startTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.submitExam();
      }
    }, 1000);
  }

  get currentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  submitExam(): void {
    if (this.submitted || this.isSubmitting) {
      return;
    }
    clearInterval(this.timer);
    this.isSubmitting = true;

    const formattedAnswers = Object.keys(this.answers)
      .filter((questionId) => this.answers[questionId])
      .map((questionId) => ({
        questionId,
        selected_answer: this.answers[questionId],
      }));

    this.submitSubscription = this.studentExamService
      .submitExam(this.exam._id, formattedAnswers, this.examStartTime)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.examResult = response.data.result;
            this.submitted = true;
          } else {
            this.showError('Failed to submit exam.');
          }
        },
        error: (error) => {
          this.showError(
            error || 'An error occurred while submitting the exam.'
          );
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.router.navigate(['/student/dashboard']);
  }

  get score(): number {
    return this.examResult?.percentage || 0;
  }

  goToDashboard(): void {
    this.router.navigate(['/student/dashboard']);
  }

  goToResults(): void {
    this.router.navigate(['/student/results']);
  }

  trackByOption(index: number, option: any) {
    return option.option_label;
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.examSubscription?.unsubscribe();
    this.submitSubscription?.unsubscribe();
  }
}
