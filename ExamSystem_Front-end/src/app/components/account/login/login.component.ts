import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { LoadComponent } from "../../../shared/load/load.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, LoadComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
progress = 0; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
this.progress = 0;
    this.simulateProgress(); 
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          // Navigate based on user role
          const user = response.data.user;
          if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/student']);
          }
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.errorMessage = error;
          this.isLoading = false;
        },
        complete: () => {
                  this.progress = 100;

          this.isLoading = false;
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
  simulateProgress(): void {
  const interval = setInterval(() => {
    if (this.progress < 90) {
      this.progress += 10;
    } else {
      clearInterval(interval);
    }
  }, 200);
}

}
