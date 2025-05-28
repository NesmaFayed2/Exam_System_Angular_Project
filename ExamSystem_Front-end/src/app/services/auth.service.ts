import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:5000/api/auth';
  private readonly TOKEN_KEY = 'exam_auth_token';
  private readonly USER_DATA = 'user_data';

  private userDataSubject = new BehaviorSubject<any>(this.getUserData());
  userData$ = this.userDataSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}
  updateUserData(userData: any): void {
    localStorage.setItem(this.USER_DATA, JSON.stringify(userData));
    this.userDataSubject.next(userData);
  }

  register(userData: any): Observable<any> {
    const registerData = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      password: userData.password,
      major: userData.major,
    };

    return this.http.post(`${this.API_URL}/register`, registerData).pipe(
      tap((response: any) => {
        if (response.status === 'success') {
          localStorage.setItem(this.TOKEN_KEY, response.data.accessToken);
          localStorage.setItem(
            this.USER_DATA,
            JSON.stringify(response.data.user)
          );
          this.userDataSubject.next(response.data.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.status === 'success') {
          localStorage.setItem(this.TOKEN_KEY, response.data.accessToken);
          localStorage.setItem(
            this.USER_DATA,
            JSON.stringify(response.data.user)
          );
          this.userDataSubject.next(response.data.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.API_URL}/logout`, {}, { headers }).pipe(
      tap(() => {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_DATA);
        this.userDataSubject.next(null);
        this.router.navigate(['/account/login']);
      }),
      catchError((error) => {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_DATA);
        this.userDataSubject.next(null);
        this.router.navigate(['/account/login']);
        return throwError(error);
      })
    );
  }

  getProfile(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http
      .get(`${this.API_URL}/profile`, { headers })
      .pipe(catchError(this.handleError));
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserData(): any {
    const userData = localStorage.getItem(this.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private handleError(error: any) {
    console.error('Auth Service Error:', error);
    const errorMessage =
      error.error?.data?.message || error.error?.message || 'An error occurred';
    return throwError(errorMessage);
  }
}
