import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  changeForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.changeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  passwordsMatch(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmNewPassword')?.value
      ? null
      : form.get('confirmNewPassword')?.setErrors({ mismatch: true });
  }

  onSubmit() {
    const storedEmail = localStorage.getItem('studentEmail');
    const { email, newPassword } = this.changeForm.value;

    if (this.changeForm.valid && email === storedEmail) {
      localStorage.setItem('studentPassword', newPassword);
      alert('Password changed successfully!');
      this.router.navigate(['/account/login']);
    } else {
      alert('Email not found or form invalid.');
      this.changeForm.markAllAsTouched();
    }
  }
}
