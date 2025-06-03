import { LoadComponent } from './../../../shared/load/load.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminExamService } from '../../../services/admin-exam.service';
import { Subscription } from 'rxjs';

interface QuestionData {
  _id?: string;
  question_text: string;
  options: {
    option_text: string;
    option_label: string;
    is_correct: boolean;
  }[];
  correct_answer: string;
  marks: number;
  order: number;
}

@Component({
  selector: 'app-exam-question-manager',
  standalone: true,
  imports: [LoadComponent, CommonModule, FormsModule, RouterLink],
  templateUrl: './exam-question-manager.component.html',
  styleUrls: ['./exam-question-manager.component.css'],
})
export class ExamQuestionManagerComponent implements OnInit, OnDestroy {
  examId: string | null = null;
  examTitle: string = '';
  questions: QuestionData[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  // Modal properties
  showConfirmModal: boolean = false;
  showErrorModal: boolean = false;
  showSuccessModal: boolean = false;
  errorModalMessage: string = '';
  successModalMessage: string = '';
  questionToRemoveIndex: number | null = null;

  private subscriptions: Subscription = new Subscription();
  readonly optionLabels = ['A', 'B', 'C', 'D'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminExamService: AdminExamService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.paramMap.subscribe((params) => {
        this.examId = params.get('id');
        if (this.examId) {
          this.loadExamDetailsAndQuestions();
        } else {
          this.errorMessage = 'Invalid exam ID provided for question manager.';
          this.router.navigate(['/admin/examlist']);
        }
      })
    );
  }

  loadExamDetailsAndQuestions(): void {
    if (!this.examId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.subscriptions.add(
      this.adminExamService.getExamById(this.examId).subscribe({
        next: (exam) => {
          if (exam) {
            this.examTitle = exam.title;
            this.loadQuestions();
          } else {
            this.errorMessage = `Exam with ID ${this.examId} not found.`;
            this.router.navigate(['/admin/examlist']);
          }
        },
        error: (err) => {
          this.errorMessage = err;
          this.isLoading = false;
        },
      })
    );
  }

  loadQuestions(): void {
    if (!this.examId) return;

    this.subscriptions.add(
      this.adminExamService.getExamQuestions(this.examId).subscribe({
        next: (questions) => {
          this.questions = questions || [];
        },
        error: (err) => {
          this.errorMessage = err;
        },
        complete: () => {
          this.isLoading = false;
        },
      })
    );
  }

  addQuestion(): void {
    const newQuestion: QuestionData = {
      question_text: '',
      options: this.optionLabels.map((label) => ({
        option_text: '',
        option_label: label,
        is_correct: false,
      })),
      correct_answer: 'A',
      marks: 1,
      order: this.questions.length + 1,
    };
    this.questions.push(newQuestion);
  }

  confirmRemoveQuestion(index: number): void {
    this.questionToRemoveIndex = index;
    this.showConfirmModal = true;
  }

  cancelDelete(): void {
    this.questionToRemoveIndex = null;
    this.showConfirmModal = false;
  }

  removeQuestion(): void {
    if (this.questionToRemoveIndex === null) return;

    const questionToRemove = this.questions[this.questionToRemoveIndex];
    if (this.examId && questionToRemove._id) {
      this.subscriptions.add(
        this.adminExamService.deleteQuestion(questionToRemove._id).subscribe({
          next: () => {
            this.questions.splice(this.questionToRemoveIndex!, 1);
            this.updateQuestionOrders();
            this.showSuccessModal = true;
            this.successModalMessage = 'Question removed successfully!';
          },
          error: (err) => {
            this.showErrorModal = true;
            this.errorModalMessage = 'Error deleting question: ' + err;
          },
          complete: () => {
            this.questionToRemoveIndex = null;
            this.showConfirmModal = false;
          },
        })
      );
    } else {
      this.questions.splice(this.questionToRemoveIndex, 1);
      this.updateQuestionOrders();
      this.questionToRemoveIndex = null;
      this.showConfirmModal = false;
    }
  }

  validateAndSaveQuestions(): void {
    if (!this.examId) return;

    // Validate all questions
    for (const question of this.questions) {
      if (!question.question_text.trim()) {
        this.showErrorModal = true;
        this.errorModalMessage =
          'Question text cannot be empty for all questions.';
        return;
      }
      if (question.options.length !== 4) {
        this.showErrorModal = true;
        this.errorModalMessage =
          'Each question must have exactly four choices.';
        return;
      }
      if (question.options.some((o) => !o.option_text.trim())) {
        this.showErrorModal = true;
        this.errorModalMessage =
          'All choice texts must be filled for all questions.';
        return;
      }
      if (
        !question.correct_answer ||
        !question.options.some(
          (o) => o.option_label === question.correct_answer
        )
      ) {
        this.showErrorModal = true;
        this.errorModalMessage =
          'A valid correct answer must be selected for all questions.';
        return;
      }
      if (!question.marks || question.marks <= 0) {
        this.showErrorModal = true;
        this.errorModalMessage =
          'Score for all questions must be a positive number.';
        return;
      }
    }

    // If validation passes, save all questions
    this.saveAllQuestions();
  }

  saveAllQuestions(): void {
    if (!this.examId) return;

    let saveCount = 0;
    const totalQuestions = this.questions.length;

    for (const question of this.questions) {
      question.options.forEach((option) => {
        option.is_correct = option.option_label === question.correct_answer;
      });

      const saveOperation = question._id
        ? this.adminExamService.updateQuestion(question._id, question)
        : this.adminExamService.addQuestion(this.examId!, question);

      this.subscriptions.add(
        saveOperation.subscribe({
          next: () => {
            saveCount++;
            if (saveCount === totalQuestions) {
              this.showSuccessModal = true;
              this.successModalMessage = 'All questions saved successfully!';
              this.router.navigate(['/admin/view-exam/', this.examId]);
            }
          },
          error: (err) => {
            this.showErrorModal = true;
            this.errorModalMessage =
              'Error saving some questions. Please try again.';
          },
        })
      );
    }
  }

  closeErrorModal(): void {
    this.showErrorModal = false;
    this.errorModalMessage = '';
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.successModalMessage = '';
  }

  updateQuestionOrders(): void {
    this.questions.forEach((question, index) => {
      question.order = index + 1;
    });
  }

  trackQuestionById(index: number, question: QuestionData): string {
    return question._id || index.toString();
  }

  trackOptionById(index: number, option: any): string {
    return option.option_label;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
