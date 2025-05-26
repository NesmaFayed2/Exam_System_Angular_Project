import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, switchMap, map } from 'rxjs/operators';
import { Exam, ExamTrack, Question } from '../models/exam'; // Import ExamTrack

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  private static readonly EXAMS_KEY = 'mock_exams_data';
  private _examsSubject: BehaviorSubject<Exam[]>;

  constructor() {
    const storedExams = localStorage.getItem(ExamService.EXAMS_KEY);
    let initialExams: Exam[];

    if (storedExams) {
      initialExams = JSON.parse(storedExams).map((exam: Exam) => ({
        ...exam,
        track: (exam.track || 'DotNet') as ExamTrack, // Provide a default if track is missing
      }));
    } else {
      // Your predefined sample data - ensure 'track' is explicitly set for all
      initialExams = [
        {
          id: 1,
          title: 'Introduction to Angular',
          description: 'Covers basic concepts of Angular framework.',
          startDate: '2024-06-01',
          endDate: '2024-06-01',
          duration: 60,
          track: 'MEARN',
          questions: [
            {
              id: 1,
              text: 'What is Angular?',
              choices: [
                { id: 101, text: 'A JavaScript framework' },
                { id: 102, text: 'A coffee brand' },
                { id: 103, text: 'A programming language' },
              ],
              correctAnswer: 'A JavaScript framework',
              score: 5,
            },
            {
              id: 2,
              text: 'Who develops Angular?',
              choices: [
                { id: 201, text: 'Microsoft' },
                { id: 202, text: 'Google' },
                { id: 203, text: 'Apple' },
              ],
              correctAnswer: 'Google',
              score: 10,
            },
          ],
        },
        {
          id: 2,
          title: 'Node.js Basics',
          description: 'Fundamental concepts of Node.js and its ecosystem.',
          startDate: '2024-07-10',
          endDate: '2024-07-10',
          duration: 45,
          track: 'MEARN',
          questions: [
            {
              id: 3,
              text: 'What is Node.js?',
              choices: [
                { id: 301, text: 'A web server' },
                { id: 302, text: 'A JavaScript runtime' },
                { id: 303, text: 'A database' },
              ],
              correctAnswer: 'A JavaScript runtime',
              score: 8,
            },
          ],
        },
        {
          id: 3,
          title: 'Python Data Structures',
          description: 'Exploring lists, tuples, dictionaries in Python.',
          startDate: '2024-08-01',
          endDate: '2024-08-05',
          duration: 90,
          track: 'PYTHON',
          questions: [
            {
              id: 4,
              text: 'Which is mutable?',
              choices: [
                { id: 401, text: 'Tuple' },
                { id: 402, text: 'List' },
                { id: 403, text: 'String' },
              ],
              correctAnswer: 'List',
              score: 7,
            },
          ],
        },
        {
          id: 4,
          title: '.NET Core API Development',
          description: 'Building RESTful APIs with ASP.NET Core.',
          startDate: '2024-09-15',
          endDate: '2024-09-20',
          duration: 120,
          track: 'DotNet',
          questions: [
            {
              id: 5,
              text: 'Which is a .NET language?',
              choices: [
                { id: 501, text: 'Java' },
                { id: 502, text: 'C#' },
                { id: 503, text: 'Ruby' },
              ],
              correctAnswer: 'C#',
              score: 12,
            },
          ],
        },
      ];
    }
    this._examsSubject = new BehaviorSubject<Exam[]>(initialExams);

    this.saveExamsToLocalStorage(initialExams);
  }

  private saveExamsToLocalStorage(exams: Exam[]): void {
    localStorage.setItem(ExamService.EXAMS_KEY, JSON.stringify(exams));
  }

  getAll(): Observable<Exam[]> {
    return this._examsSubject.asObservable().pipe(delay(200));
  }

  getById(id: number): Observable<Exam | undefined> {
    return this._examsSubject.asObservable().pipe(
      delay(200),
      map((exams) => exams.find((exam) => exam.id === id))
    );
  }

  save(exam: Exam): Observable<Exam> {
    return of(null).pipe(
      delay(500),
      switchMap(() => {
        const currentExams = this._examsSubject.getValue();
        let updatedExam: Exam;

        if (exam.id) {
          const index = currentExams.findIndex((e) => e.id === exam.id);
          if (index > -1) {
            const existingQuestions = currentExams[index].questions;

            updatedExam = {
              ...exam,
              questions: exam.questions || existingQuestions,
            };
            currentExams[index] = updatedExam;
          } else {
            return throwError(() => new Error('Exam not found for update.'));
          }
        } else {
          const newId =
            currentExams.length > 0
              ? Math.max(...currentExams.map((e) => e.id)) + 1
              : 1;

          updatedExam = {
            ...exam,
            id: newId,
            questions: [],
            track: exam.track || 'DotNet',
          };
          currentExams.push(updatedExam);
        }

        this.saveExamsToLocalStorage(currentExams);
        this._examsSubject.next(currentExams);
        return of(updatedExam);
      })
    );
  }

  delete(id: number): Observable<void> {
    return of(null).pipe(
      delay(300),
      switchMap(() => {
        const currentExams = this._examsSubject.getValue();
        const updatedExams = currentExams.filter((exam) => exam.id !== id);
        this.saveExamsToLocalStorage(updatedExams);
        this._examsSubject.next(updatedExams);
        return of(void 0);
      })
    );
  }

  getExamQuestions(examId: number): Observable<Question[]> {
    return this.getById(examId).pipe(
      map((exam) => (exam ? exam.questions : [])),
      delay(100)
    );
  }

  saveQuestion(examId: number, question: Question): Observable<Question> {
    return of(null).pipe(
      delay(400),
      switchMap(() => {
        const currentExams = this._examsSubject.getValue();
        const examIndex = currentExams.findIndex((e) => e.id === examId);

        if (examIndex === -1) {
          return throwError(
            () => new Error('Exam not found to save question.')
          );
        }

        const examToUpdate = { ...currentExams[examIndex] };
        let updatedQuestion: Question;

        if (question.id) {
          const qIndex = examToUpdate.questions.findIndex(
            (q) => q.id === question.id
          );
          if (qIndex > -1) {
            updatedQuestion = { ...question };
            examToUpdate.questions[qIndex] = updatedQuestion;
          } else {
            return throwError(
              () => new Error('Question not found for update.')
            );
          }
        } else {
          const newQId =
            examToUpdate.questions.length > 0
              ? Math.max(...examToUpdate.questions.map((q) => q.id)) + 1
              : 1;
          updatedQuestion = {
            ...question,
            id: newQId,
            choices: question.choices || [],
          };
          examToUpdate.questions.push(updatedQuestion);
        }

        currentExams[examIndex] = examToUpdate;
        this.saveExamsToLocalStorage(currentExams);
        this._examsSubject.next(currentExams);
        return of(updatedQuestion);
      })
    );
  }

  deleteQuestion(examId: number, questionId: number): Observable<void> {
    return of(null).pipe(
      delay(300),
      switchMap(() => {
        const currentExams = this._examsSubject.getValue();
        const examIndex = currentExams.findIndex((e) => e.id === examId);

        if (examIndex === -1) {
          return throwError(
            () => new Error('Exam not found to delete question.')
          );
        }

        const examToUpdate = { ...currentExams[examIndex] };
        examToUpdate.questions = examToUpdate.questions.filter(
          (q) => q.id !== questionId
        );

        currentExams[examIndex] = examToUpdate;
        this.saveExamsToLocalStorage(currentExams);
        this._examsSubject.next(currentExams);
        return of(void 0);
      })
    );
  }
}
