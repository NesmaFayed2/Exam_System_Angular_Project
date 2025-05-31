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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './exam-question-manager.component.html',
  styleUrls: ['./exam-question-manager.component.css'],
})
export class ExamQuestionManagerComponent implements OnInit, OnDestroy {
  examId: string | null = null;
  examTitle: string = '';
  questions: QuestionData[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

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

  removeQuestion(index: number): void {
    if (confirm('Are you sure you want to remove this question?')) {
      const questionToRemove = this.questions[index];
      if (this.examId && questionToRemove._id) {
        this.subscriptions.add(
          this.adminExamService.deleteQuestion(questionToRemove._id).subscribe({
            next: () => {
              this.questions.splice(index, 1);
              this.updateQuestionOrders();
            },
            error: (err) => {
              alert('Error deleting question: ' + err);
            },
          })
        );
      } else {
        this.questions.splice(index, 1);
        this.updateQuestionOrders();
      }
    }
  }

  addChoice(question: QuestionData): void {
    if (question.options.length < 4) {
      const nextLabel = this.optionLabels[question.options.length];
      question.options.push({
        option_text: '',
        option_label: nextLabel,
        is_correct: false,
      });
    }
  }

  removeChoice(question: QuestionData, choiceIndex: number): void {
    if (question.options.length > 2) {
      const removedOption = question.options[choiceIndex];
      if (question.correct_answer === removedOption.option_label) {
        question.correct_answer = question.options[0].option_label;
      }
      question.options.splice(choiceIndex, 1);
      this.updateOptionLabels(question);
    } else {
      alert('A question must have at least two choices.');
    }
  }

  updateOptionLabels(question: QuestionData): void {
    question.options.forEach((option, index) => {
      option.option_label = this.optionLabels[index];
    });
  }

  updateQuestionOrders(): void {
    this.questions.forEach((question, index) => {
      question.order = index + 1;
    });
  }

  saveQuestion(question: QuestionData): void {
    if (!this.examId) return;

    // Validation
    if (!question.question_text.trim()) {
      alert('Question text cannot be empty.');
      return;
    }
    if (question.options.length !== 4) {
      alert('Each question must have exactly four choices (A, B, C, D).');
      return;
    }
    if (question.options.some((o) => !o.option_text.trim())) {
      alert('All choice texts must be filled.');
      return;
    }
    if (
      !question.correct_answer ||
      !question.options.some((o) => o.option_label === question.correct_answer)
    ) {
      alert('A valid correct answer must be selected.');
      return;
    }
    if (!question.marks || question.marks <= 0) {
      alert('Score for the question must be a positive number.');
      return;
    }

    // Update is_correct flags
    question.options.forEach((option) => {
      option.is_correct = option.option_label === question.correct_answer;
    });

    const saveOperation = question._id
      ? this.adminExamService.updateQuestion(question._id, question)
      : this.adminExamService.addQuestion(this.examId, question);

    this.subscriptions.add(
      saveOperation.subscribe({
        next: (response) => {
          const savedQuestion = response.data?.question || response;
          const index = this.questions.findIndex((q) => q === question);
          if (index !== -1) {
            this.questions[index] = savedQuestion;
          }
          alert('Question saved successfully!');
        },
        error: (err) => {
          alert('Error saving question: ' + err);
        },
      })
    );
  }

  saveAllQuestions(): void {
    if (!this.examId) return;

    for (const question of this.questions) {
      if (!question.question_text.trim()) {
        alert('Cannot save: Question text cannot be empty for all questions.');
        return;
      }
      if (question.options.length !== 4) {
        alert('Cannot save: Each question must have exactly four choices.');
        return;
      }
      if (question.options.some((o) => !o.option_text.trim())) {
        alert(
          'Cannot save: All choice texts must be filled for all questions.'
        );
        return;
      }
      if (
        !question.correct_answer ||
        !question.options.some(
          (o) => o.option_label === question.correct_answer
        )
      ) {
        alert(
          'Cannot save: A valid correct answer must be selected for all questions.'
        );
        return;
      }
      if (!question.marks || question.marks <= 0) {
        alert(
          'Cannot save: Score for all questions must be a positive number.'
        );
        return;
      }
    }

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
              alert('All questions saved successfully!');
              this.router.navigate(['/admin/examlist']);
            }
          },
          error: (err) => {
            alert('Error saving some questions. Please try again.');
          },
        })
      );
    }
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
