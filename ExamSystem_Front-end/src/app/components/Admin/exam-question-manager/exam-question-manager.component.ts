import { ExamService } from '../../../services/exam.service';
import { Exam, Question, Choice } from '../../../models/exam';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-exam-question-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './exam-question-manager.component.html',
  styleUrls: ['./exam-question-manager.component.css'],
})
export class ExamQuestionManagerComponent implements OnInit, OnDestroy {
  examId: number | null = null;
  examTitle: string = '';
  questions: Question[] = [];
  private subscriptions: Subscription = new Subscription();
  public String = String; // Expose String object for template (for A, B, C...)

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.paramMap.subscribe((params) => {
        this.examId = Number(params.get('id'));
        if (this.examId && !isNaN(this.examId) && this.examId > 0) {
          this.loadExamDetailsAndQuestions();
        } else {
          console.error('Invalid exam ID provided for question manager.');
          this.router.navigate(['/admin/examlist']);
        }
      })
    );
  }

  loadExamDetailsAndQuestions(): void {
    if (this.examId === null) return;

    this.subscriptions.add(
      this.examService.getById(this.examId).subscribe({
        next: (exam) => {
          if (exam) {
            this.examTitle = exam.title;

            this.questions = exam.questions.map((q) => ({
              ...q,
              score: q.score || 1,
            }));
          } else {
            console.warn(`Exam with ID ${this.examId} not found.`);
            this.router.navigate(['/admin/examlist']);
          }
        },
        error: (err) => {
          console.error('Error loading exam details:', err);
          this.router.navigate(['/admin/examlist']);
        },
      })
    );
  }

  addQuestion(): void {
    const newQuestion: Question = {
      id: 0,
      text: '',
      choices: [
        { id: 0, text: '' },
        { id: 0, text: '' },
      ],
      correctAnswer: '',
      score: 1,
    };
    this.questions.push(newQuestion);
  }

  removeQuestion(index: number): void {
    if (confirm('Are you sure you want to remove this question?')) {
      const questionToRemove = this.questions[index];
      if (this.examId !== null && questionToRemove.id > 0) {
        this.subscriptions.add(
          this.examService
            .deleteQuestion(this.examId, questionToRemove.id)
            .subscribe({
              next: () => {
                this.questions.splice(index, 1);
                console.log('Question deleted from service.');
              },
              error: (err) => console.error('Error deleting question:', err),
            })
        );
      } else {
        this.questions.splice(index, 1);
      }
    }
  }

  addChoice(question: Question): void {
    question.choices.push({ id: 0, text: '' });
  }

  removeChoice(question: Question, choiceIndex: number): void {
    if (question.choices.length > 1) {
      if (question.correctAnswer === question.choices[choiceIndex].text) {
        question.correctAnswer = '';
      }
      question.choices.splice(choiceIndex, 1);
    } else {
      alert('A question must have at least one choice.');
    }
  }

  saveQuestion(question: Question): void {
    if (this.examId === null) {
      console.error('Exam ID is missing. Cannot save question.');
      return;
    }

    if (!question.text.trim()) {
      alert('Question text cannot be empty.');
      return;
    }
    if (question.choices.length < 2) {
      alert('A question must have at least two choices.');
      return;
    }
    if (question.choices.some((c) => !c.text.trim())) {
      alert('All choice texts must be filled.');
      return;
    }
    // Corrected validation for correctAnswer
    if (
      !question.correctAnswer ||
      !question.choices.some((c) => c.text === question.correctAnswer)
    ) {
      alert(
        'A valid correct answer must be selected for the question from the available choices.'
      );
      return;
    }
    if (question.score === null || question.score <= 0) {
      alert('Score for the question must be a positive number.');
      return;
    }

    this.subscriptions.add(
      this.examService.saveQuestion(this.examId, question).subscribe({
        next: (savedQuestion) => {
          const index = this.questions.findIndex((q) => q === question);
          if (index !== -1) {
            this.questions[index] = savedQuestion;
            console.log('Question saved successfully:', savedQuestion);
          }
        },
        error: (err) => console.error('Error saving question:', err),
      })
    );
  }

  saveAllQuestions(): void {
    if (this.examId === null) {
      console.error('Exam ID is missing. Cannot save all questions.');
      return;
    }

    // Iterate and save each question individually, with validation
    for (const question of this.questions) {
      if (!question.text.trim()) {
        alert('Cannot save: Question text cannot be empty for all questions.');
        return;
      }
      if (question.choices.length < 2) {
        alert('Cannot save: All questions must have at least two choices.');
        return;
      }
      if (question.choices.some((c) => !c.text.trim())) {
        alert(
          'Cannot save: All choice texts must be filled for all questions.'
        );
        return;
      }
      if (
        !question.correctAnswer ||
        !question.choices.some((c) => c.text === question.correctAnswer)
      ) {
        alert(
          'Cannot save: A valid correct answer must be selected for all questions from the available choices.'
        );
        return;
      }
      if (question.score === null || question.score <= 0) {
        alert(
          'Cannot save: Score for all questions must be a positive number.'
        );
        return;
      }
      // If all checks pass, save the question
      this.saveQuestion(question); // This will trigger individual save logic
    }
    alert('All questions updated/saved.');
    this.router.navigate(['/admin/examlist']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
