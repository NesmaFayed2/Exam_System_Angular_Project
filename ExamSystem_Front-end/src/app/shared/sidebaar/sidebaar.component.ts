import { Component } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  NavigationEnd,
  Router,
} from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebaar',
  standalone: true,
  templateUrl: './sidebaar.component.html',
  styleUrls: ['./sidebaar.component.css'],
  imports: [RouterLink, RouterLinkActive],
})
export class SidebaarComponent {
  showSideBar = true;

  constructor(private authService: AuthService, private router: Router) {
    this.showSideBar = !this.router.url.includes('/student/exam/');

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showSideBar = !event.urlAfterRedirects.includes('/student/exam/');
      }
    });
  }

  onLogOut(): void {
    this.authService.logout();
  }
}
