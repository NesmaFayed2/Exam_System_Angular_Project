import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

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
      const formEmail = this.loginForm.value.email;
      const formPassword = this.loginForm.value.password;
      const user = this.authService.findUserByEmail(formEmail);

      if (user && user.password === formPassword) {
        this.authService.login(user);
        this.router.navigate(['/student']);
      } else {
        alert('Invalid login. Please check your email and password.');
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
