// services/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly API_URL = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('exam_auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getProfile(): Observable<any> {
    return this.http
      .get(`${this.API_URL}/profile`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http
      .patch(`${this.API_URL}/edit-profile`, profileData, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  changePassword(passwordData: any): Observable<any> {
    return this.http
      .patch(`${this.API_URL}/edit-password`, passwordData, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Profile Service Error:', error);
    const errorMessage =
      error.error?.data?.message || error.error?.message || 'An error occurred';
    return throwError(errorMessage);
  }
}
