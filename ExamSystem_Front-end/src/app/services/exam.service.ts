import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentExamService {
  private readonly API_URL = 'http://localhost:5000/api/student';

  constructor(private http: HttpClient) {}

  getAvailableExams(): Observable<any> {
    const token = localStorage.getItem('exam_auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http
      .get(`${this.API_URL}/exams`, { headers })
      .pipe(catchError(this.handleError));
  }

  startExam(examId: string): Observable<any> {
    const token = localStorage.getItem('exam_auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http
      .get(`${this.API_URL}/exams/${examId}/start`, { headers })
      .pipe(catchError(this.handleError));
  }

  submitExam(
    examId: string,
    answers: any[],
    startTime: string
  ): Observable<any> {
    const token = localStorage.getItem('exam_auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const payload = {
      answers,
      start_time: startTime,
    };

    return this.http
      .post(`${this.API_URL}/exams/${examId}/submit`, payload, { headers })
      .pipe(catchError(this.handleError));
  }

  getExamResult(examId: string): Observable<any> {
    const token = localStorage.getItem('exam_auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http
      .get(`${this.API_URL}/exams/${examId}/result`, { headers })
      .pipe(catchError(this.handleError));
  }

  getAllResults(): Observable<any> {
    const token = localStorage.getItem('exam_auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http
      .get(`${this.API_URL}/results`, { headers })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Student Exam Service Error:', error);
    const errorMessage =
      error.error?.data?.message || error.error?.message || 'An error occurred';
    return throwError(errorMessage);
  }
}
