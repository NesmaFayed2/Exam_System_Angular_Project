import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ExamResult } from '../models/exam-result.model';

@Injectable({
  providedIn: 'root',
})
export class ResultService {
  private readonly API_URL = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('exam_auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
   * GET /admin/results - Get all students' exam results
   */
  getAllExamResults(): Observable<ExamResult[]> {
    return this.http
      .get<any>(`${this.API_URL}/admin/results`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          return response.data.results.map((result: any) => ({
            id: result.result_id || result.id,
            studentName: result.student_name,
            examTitle: result.exam_title,
            totalScore: result.total_score,
            submittedAt: new Date(result.submitted_at),
            studentEmail: result.student_email,
            maxMarks: result.max_marks,
            percentage: result.percentage,
            status: result.status,
          }));
        }),
        catchError(this.handleError)
      );
  }

  /**
   * GET /admin/results/:examId - Get results for a specific exam
   */
  getResultsForSpecificExam(examId: string): Observable<ExamResult[]> {
    return this.http
      .get<any>(`${this.API_URL}/admin/results/${examId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          // Map the API response to your ExamResult model
          return response.data.results.map((result: any) => ({
            id: result.result_id || result.id,
            studentName: result.student_name,
            examTitle: result.exam_title,
            totalScore: result.total_score,
            submittedAt: new Date(result.submitted_at),
            // Optional: Include additional fields if needed
            studentEmail: result.student_email,
            maxMarks: result.max_marks,
            percentage: result.percentage,
            status: result.status,
          }));
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Error handler for HTTP requests
   */
  private handleError(error: any): Observable<never> {
    console.error('ResultService Error:', error);
    const errorMessage =
      error.error?.data?.message ||
      error.error?.message ||
      error.message ||
      'An error occurred while fetching results';
    throw new Error(errorMessage);
  }
}
