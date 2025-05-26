// src/app/components/Admin/admin-profile/admin-profile.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common'; // Import TitleCasePipe
import { FormsModule } from '@angular/forms'; // For ngModel
import { UserService } from './../../../services/user.service'; // Adjust path if necessary
import { User } from './../../../models/user'; // Adjust path if necessary
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe], // Add TitleCasePipe here
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css'],
})
export class AdminProfileComponent implements OnInit, OnDestroy {
  adminUser: User | null = null;
  editMode: boolean = false;
  editedEmail: string = '';
  currentPassword: string = ''; // Holds the user's current password input
  newPassword: string = ''; // Holds the user's new password input
  successMessage: string | null = null;
  errorMessage: string | null = null;
  private userSubscription: Subscription | undefined;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadAdminProfile();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  /**
   * Loads the current admin profile from the service.
   */
  loadAdminProfile(): void {
    this.userSubscription = this.userService.getAdminProfile().subscribe({
      next: (user: User) => {
        this.adminUser = user;
        this.editedEmail = user.email; // Initialize editedEmail
        this.clearMessages(); // Clear any existing messages on successful load
      },
      error: (err) => {
        console.error('Failed to load admin profile:', err);
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.adminUser = null; // Clear user data if there's an error
      },
    });
  }

  /**
   * Toggles the edit mode for the profile.
   * Resets password fields and messages when toggling.
   */
  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode && this.adminUser) {
      // If exiting edit mode (cancel), reset email and clear password fields
      this.editedEmail = this.adminUser.email;
    }
    this.currentPassword = ''; // Always clear password fields on mode change
    this.newPassword = ''; // Always clear password fields on mode change
    this.clearMessages();
  }

  /**
   * Saves the profile changes, including email and optionally password.
   */
  saveProfile(): void {
    this.clearMessages();

    if (!this.adminUser) {
      this.errorMessage = 'No admin user data to save.';
      return;
    }

    if (this.editedEmail.trim() === '') {
      this.errorMessage = 'Email cannot be empty.';
      return;
    }

    // Basic email format validation (can be more robust with regex)
    if (!this.isValidEmail(this.editedEmail)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    // Prepare update data payload
    const updateData: {
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    } = {};

    // Only include email if it has changed
    if (this.editedEmail !== this.adminUser.email) {
      updateData.email = this.editedEmail;
    }

    // Handle password change
    if (this.newPassword) {
      if (this.newPassword.length < 6) {
        // Example: minimum password length
        this.errorMessage = 'New password must be at least 6 characters long.';
        return;
      }
      if (!this.currentPassword) {
        this.errorMessage =
          'Current password is required to change your password.';
        return;
      }
      updateData.currentPassword = this.currentPassword;
      updateData.newPassword = this.newPassword;
    }

    // If no changes were made (neither email nor password), just exit edit mode
    if (Object.keys(updateData).length === 0) {
      this.errorMessage = 'No changes detected to save.';
      this.toggleEditMode();
      return;
    }

    this.userService.updateAdminProfile(updateData).subscribe({
      next: (updatedUser: User) => {
        this.adminUser = updatedUser; // Update the component's user data with the response
        this.editedEmail = updatedUser.email; // Ensure editedEmail is in sync
        this.successMessage = 'Profile updated successfully!';
        this.toggleEditMode(); // Exit edit mode
        this.currentPassword = ''; // Clear password fields after successful save
        this.newPassword = '';
      },
      error: (err) => {
        console.error('Failed to save profile:', err);
        // Provide more specific error messages if your backend sends them
        if (err.status === 401 || err.status === 403) {
          this.errorMessage =
            'Incorrect current password or unauthorized access.';
        } else if (err.error && err.error.message) {
          this.errorMessage = 'Failed to update profile: ' + err.error.message;
        } else {
          this.errorMessage = 'Failed to update profile. Please try again.';
        }
      },
    });
  }

  /**
   * Clears success and error messages.
   */
  private clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  /**
   * Basic email format validation.
   */
  private isValidEmail(email: string): boolean {
    // A simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
