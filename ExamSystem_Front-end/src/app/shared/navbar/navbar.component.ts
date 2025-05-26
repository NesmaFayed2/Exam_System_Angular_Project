import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
  defaultImage = 'default-avatar.png';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.userData = this.authService.getUserData();
  }

  onToggleClick(): void {
    this.toggleSidebar.emit();
  }

  onLogOut(): void {
    this.authService.logout();
  }
}
