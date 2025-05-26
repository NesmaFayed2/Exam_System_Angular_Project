import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'exam_auth_token';
  private readonly USER_DATA = 'user_data';
  private readonly USERS_KEY = 'registered_users';

  private userDataSubject = new BehaviorSubject<any>(this.getUserData());
  userData$ = this.userDataSubject.asObservable();

  constructor(private router: Router) {}

  login(userData: any): void {
    localStorage.setItem(this.TOKEN_KEY, 'logged_in');
    localStorage.setItem(this.USER_DATA, JSON.stringify(userData));
    this.userDataSubject.next(userData); // تحديث البيانات
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA);
    this.userDataSubject.next(null); // إعلام المشتركين إنه خرج
    this.router.navigate(['/account/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getUserData(): any {
    const userData = localStorage.getItem(this.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  registerUser(userData: any): void {
    const users = this.getRegisteredUsers();
    users.push(userData);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  getRegisteredUsers(): any[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  findUserByEmail(email: string): any | null {
    return this.getRegisteredUsers().find(user => user.email === email) || null;
  }
}