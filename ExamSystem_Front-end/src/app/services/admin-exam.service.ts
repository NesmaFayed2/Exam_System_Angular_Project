import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdminExamService {
  private readonly API_URL = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('exam_auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // ============= EXAM CRUD OPERATIONS =============

  /**
   * GET /admin/exams - Get all exams for admin
   */
  getAllExams(): Observable<any[]> {
    return this.http
      .get<any>(`${this.API_URL}/admin/exams`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => response.data.exams),
        catchError(this.handleError)
      );
  }

  /**
   * GET /exams/:id - Get single exam by ID
   */
  getExamById(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.API_URL}/exams/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => response.data.exam),
        catchError(this.handleError)
      );
  }

  /**
   * POST /exams - Create new exam
   */
  createExam(examData: any): Observable<any> {
    return this.http
      .post<any>(`${this.API_URL}/exams`, examData, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * PATCH /exams/:id - Update existing exam
   */
  updateExam(id: string, examData: any): Observable<any> {
    return this.http
      .patch<any>(`${this.API_URL}/exams/${id}`, examData, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * DELETE /exams/:id - Delete exam
   */
  deleteExam(id: string): Observable<any> {
    return this.http
      .delete<any>(`${this.API_URL}/exams/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // ============= QUESTION CRUD OPERATIONS =============

  /**
   * POST /exams/:examId/questions - Add question to exam
   */
  addQuestion(examId: string, questionData: any): Observable<any> {
    return this.http
      .post<any>(`${this.API_URL}/exams/${examId}/questions`, questionData, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * GET /exams/:examId/questions - Get all questions for an exam
   */
  getExamQuestions(examId: string): Observable<any[]> {
    return this.http
      .get<any>(`${this.API_URL}/exams/${examId}/questions`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => response.data.questions),
        catchError(this.handleError)
      );
  }

  /**
   * GET /questions/:questionId - Get single question by ID
   */
  getQuestionById(questionId: string): Observable<any> {
    return this.http
      .get<any>(`${this.API_URL}/questions/${questionId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => response.data.question),
        catchError(this.handleError)
      );
  }

  /**
   * PATCH /questions/:questionId - Update question
   */
  updateQuestion(questionId: string, questionData: any): Observable<any> {
    return this.http
      .patch<any>(`${this.API_URL}/questions/${questionId}`, questionData, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * DELETE /questions/:questionId - Delete question
   */
  deleteQuestion(questionId: string): Observable<any> {
    return this.http
      .delete<any>(`${this.API_URL}/questions/${questionId}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // ============= ADMIN RESULTS =============

  /**
   * GET /admin/results - Get all students' exam results
   */
  getAllStudentsResults(): Observable<any[]> {
    return this.http
      .get<any>(`${this.API_URL}/admin/results`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => response.data.results),
        catchError(this.handleError)
      );
  }

  // ============= HELPER METHODS =============

  /**
   * Error handler for HTTP requests
   */
  private handleError(error: any) {
    console.error('AdminExamService Error:', error);
    const errorMessage =
      error.error?.data?.message || error.error?.message || 'An error occurred';
    return throwError(errorMessage);
  }
}
