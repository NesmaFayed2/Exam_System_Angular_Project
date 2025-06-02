import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth.service';
import { LoadComponent } from '../../../shared/load/load.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [LoadComponent,ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isEditMode = false;
  isPasswordMode = false;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  defaultImage = '/default-avatar.png';
  previewImage: string | null = null;
  user: any = null;
  userRole: string = '';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [, Validators.minLength(2)]],
      lastName: ['', [, Validators.minLength(2)]],
      email: ['', [, Validators.email]],
      major: [''],
      profile_image: [null],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    this.profileForm.disable();
    this.passwordForm.disable();
    const userData = this.authService.getUserData();
    this.userRole = userData?.role || 'student';
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (res) => {
        const user = res.data.user;
        this.user = user;
        this.profileForm.patchValue({
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          major: user.major?.name || user.major,
        });
        user.profile_image && user.profile_image.trim() !== ''
          ? 'http://localhost:5000/' + user.profile_image
          : this.defaultImage;

        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err;
        this.isLoading = false;
      },
    });
  }

  toggleEdit(): void {
    this.isEditMode = !this.isEditMode;
    this.isPasswordMode = false;
    this.successMessage = '';
    this.errorMessage = '';
    this.isEditMode ? this.profileForm.enable() : this.profileForm.disable();
    if (!this.isEditMode) this.loadProfile();
  }

  togglePasswordMode(): void {
    this.isPasswordMode = !this.isPasswordMode;
    this.isEditMode = false;
    this.successMessage = '';
    this.errorMessage = '';
    if (this.isPasswordMode) {
      this.passwordForm.enable();
      this.passwordForm.reset();
    } else {
      this.passwordForm.disable();
    }
  }

  onSubmitProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      const formData = new FormData();
      formData.append('first_name', this.profileForm.value.firstName);
      formData.append('last_name', this.profileForm.value.lastName);
      formData.append('email', this.profileForm.value.email);
      if (this.profileForm.value.major) {
        formData.append('major', this.profileForm.value.major);
      }
      if (this.profileForm.value.profile_image) {
        formData.append('profile_image', this.profileForm.value.profile_image);
      }

      this.profileService.updateProfile(formData).subscribe({
        next: (response) => {
          const updatedUser = response.data.user;
          localStorage.setItem('user_data', JSON.stringify(updatedUser));
          if (
            updatedUser.profile_image &&
            updatedUser.profile_image.trim() !== ''
          ) {
            this.previewImage = `http://localhost:5000/uploads/${
              updatedUser.profile_image
            }?t=${Date.now()}`;
          } else {
            this.previewImage = this.defaultImage;
          }

          this.profileForm.markAsPristine();
          this.authService.updateUserData(updatedUser);
          this.successMessage = 'Profile updated successfully!';
          this.toggleEdit();
        },
        error: (err) => (this.errorMessage = err),
        complete: () => (this.isLoading = false),
      });
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  onSubmitPassword(): void {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      const passwordData = {
        oldPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword,
      };
      this.profileService.changePassword(passwordData).subscribe({
        next: () => {
          this.successMessage = 'Password changed successfully!';
          this.togglePasswordMode();
        },
        error: (err) => (this.errorMessage = err),
        complete: () => (this.isLoading = false),
      });
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }

  triggerImageEdit() {
    if (this.isEditMode) {
      this.fileInput.nativeElement.click();
    }
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('Image is too large. Please select an image under 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
        this.profileForm.patchValue({ profile_image: file });
        this.profileForm.get('profile_image')?.markAsDirty();
      };
      reader.readAsDataURL(file);
    }
  }

  onImageError(event: any): void {
    if (event.target.src !== this.defaultImage) {
      event.target.src = this.defaultImage;
    }
  }
}
