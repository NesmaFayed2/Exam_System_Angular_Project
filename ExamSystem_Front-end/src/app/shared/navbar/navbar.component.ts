import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  OnDestroy,
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
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  userData: any;
  defaultImage = '/default-avatar.png';
  showUserMenu = true;
  private userSub!: Subscription;
  constructor(private router: Router, private authService: AuthService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showUserMenu = !event.urlAfterRedirects.includes('student/exam/');
      }
    });
  }

  ngOnInit(): void {
    this.userSub = this.authService.userData$.subscribe((user) => {
      this.userData = user;
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) this.userSub.unsubscribe();
  }
  getFullName(): string {
    if (!this.userData) return '';
    if (this.userData.first_name && this.userData.last_name) {
      return `${this.userData.first_name} ${this.userData.last_name}`;
    }
    return this.userData.name || this.userData.email || '';
  }

  getProfileImage(): string {
    if (
      this.userData &&
      this.userData.profile_image &&
      this.userData.profile_image.trim() !== ''
    ) {
      if (this.userData.profile_image.startsWith('http')) {
        return this.userData.profile_image;
      }
      return 'http://localhost:5000/' + this.userData.profile_image;
    }
    return this.defaultImage;
  }

  onImageError(event: any): void {
    event.target.src = this.defaultImage;
  }

  onToggleClick(): void {
    this.toggleSidebar.emit();
  }

  onLogOut(): void {
    this.authService.logout().subscribe();
  }
}
