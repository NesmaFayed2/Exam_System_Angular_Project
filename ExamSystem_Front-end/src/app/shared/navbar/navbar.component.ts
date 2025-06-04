import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  NavigationEnd,
} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  userData: any = null;
  readonly defaultImage = '/default-avatar.png';
  showUserMenu = true;
  private userSub!: Subscription;
  profileImageUrl: string = this.defaultImage;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) {
    this.updateNavbarVisibility(this.router.url);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateNavbarVisibility(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit(): void {
    this.userSub = this.authService.userData$.subscribe((user) => {
      this.userData = user;
      Promise.resolve().then(() => {
        // Defer update
        this.updateProfileImageUrl();
        this.cdRef.markForCheck();
      });
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  private updateNavbarVisibility(url: string): void {
    this.showUserMenu = !url.includes('/student/exam/');
  }

  private updateProfileImageUrl(): void {
    if (
      this.userData &&
      this.userData.profile_image &&
      this.userData.profile_image.trim() !== ''
    ) {
      const filenameOrPath = this.userData.profile_image;

      if (filenameOrPath.startsWith('http')) {
        // Absolute URL
        this.profileImageUrl = filenameOrPath;
      } else {
        // Assuming filenameOrPath should be just the filename, e.g., "user.png"
        // Remove potential leading "uploads/" if backend accidentally includes it
        const cleanFilename = filenameOrPath.startsWith('uploads/')
          ? filenameOrPath.substring('uploads/'.length)
          : filenameOrPath;
        this.profileImageUrl = `http://localhost:5000/uploads/${cleanFilename}?t=${Date.now()}`;
      }
    } else {
      this.profileImageUrl = this.defaultImage;
    }
  }

  getFullName(): string {
    if (!this.userData) return 'User';
    if (this.userData.first_name && this.userData.last_name) {
      return `${this.userData.first_name} ${this.userData.last_name}`;
    }
    return this.userData.name || this.userData.email || 'User';
  }

  onImageError(event: any): void {
    if (event.target.src !== this.defaultImage) {
      event.target.src = this.defaultImage;
    }
  }

  onToggleClick(): void {
    this.toggleSidebar.emit();
  }

  onLogOut(): void {
    this.authService.logout().subscribe();
  }
}
