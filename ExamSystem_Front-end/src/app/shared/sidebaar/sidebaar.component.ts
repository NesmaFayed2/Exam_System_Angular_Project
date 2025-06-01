import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SidebarService } from '../../services/sidebar.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebaar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive,CommonModule],
  templateUrl: './sidebaar.component.html',
  styleUrls: ['./sidebaar.component.css'],
})
export class SidebaarComponent implements OnInit, OnDestroy {
  showSideBar = true;
  user: any;
  private sub = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUserData();

    this.sub.add(
      this.sidebarService.sidebarVisible$.subscribe(visible => {
        this.showSideBar = visible && !this.router.url.includes('/student/exam/');
      })
    );

    this.sub.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.showSideBar = !event.urlAfterRedirects.includes('/student/exam/');
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onLogOut(): void {
    this.authService.logout();
  }
}
