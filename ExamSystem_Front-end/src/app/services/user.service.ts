// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { User } from '../models/user'; // Adjust path if needed

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private static readonly ADMIN_KEY = 'current_admin_user';
  // Use a strong type for the BehaviorSubject, ensuring it always holds a User or null
  private _adminUser: BehaviorSubject<User | null>;

  constructor() {
    const storedUser = localStorage.getItem(UserService.ADMIN_KEY);
    let initialUser: User | null;

    if (storedUser) {
      initialUser = JSON.parse(storedUser);
      // Optional: Basic validation if 'role' from localStorage is not correct type
      if (
        initialUser &&
        initialUser.role !== 'admin' &&
        initialUser.role !== 'student'
      ) {
        console.warn(
          'Invalid role found in localStorage for admin user. Defaulting to admin.'
        );
        initialUser.role = 'admin'; // Correct the type if it was somehow corrupted
      }
    } else {
      // Initialize with a known correct type for 'role'
      initialUser = {
        id: 1,
        email: 'admin@example.com',
        role: 'admin', // <-- Literal type 'admin'
        password: 'admin_password_hash',
      };
      localStorage.setItem(UserService.ADMIN_KEY, JSON.stringify(initialUser));
    }
    this._adminUser = new BehaviorSubject<User | null>(initialUser);
  }

  getCurrentAdminUser(): Observable<User | null> {
    return this._adminUser.asObservable();
  }

  getAdminProfile(): Observable<User> {
    return this._adminUser.asObservable().pipe(
      delay(300),
      switchMap((user) => {
        if (user && user.role === 'admin') {
          const { password, ...userWithoutPassword } = user;
          // Explicitly cast to User for clarity, ensuring 'role' is correct
          return of(userWithoutPassword as User);
        }
        return throwError(
          () => new Error('Admin profile not found or not an admin.')
        );
      })
    );
  }

  updateAdminProfile(updatedUser: Partial<User>): Observable<User> {
    return of(null).pipe(
      // Use 'of(null)' as a placeholder, delay, then perform logic
      delay(500),
      switchMap(() => {
        const currentUser = this._adminUser.getValue();
        if (currentUser && currentUser.role === 'admin') {
          // Construct newUser with a guaranteed 'admin' literal type for 'role'
          const newUser: User = {
            // <-- Explicitly type newUser as User
            ...currentUser,
            ...updatedUser,
            role: 'admin', // <-- This literal 'admin' is correct for the union type
          };

          this._adminUser.next(newUser); // TypeScript now correctly verifies newUser against User
          localStorage.setItem(UserService.ADMIN_KEY, JSON.stringify(newUser));

          const { password, ...newUserWithoutPassword } = newUser;
          return of(newUserWithoutPassword as User);
        }
        return throwError(
          () =>
            new Error('Failed to update admin profile. Current user not admin.')
        );
      })
    );
  }
}
