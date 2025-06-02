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
import { LoadComponent } from '../../../shared/load/load.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [LoadComponent,ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  // Available majors (matching your backend)
  majors = [
    { value: 'mern', label: 'MERN Stack' },
    { value: 'dotnet', label: '.NET' },
    { value: 'python', label: 'Python' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        major: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = this.registerForm.value;

      this.authService.register(formData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          // Navigate to login
          this.router.navigate(['/account/login'], {
            queryParams: { registered: 'true' },
          });
        },
        error: (error) => {
          console.error('Registration failed:', error);
          this.errorMessage = error;
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
