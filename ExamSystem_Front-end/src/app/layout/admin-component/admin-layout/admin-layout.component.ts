import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { filter } from 'rxjs';
import { SidebaarComponent } from '../../../shared/sidebaar/sidebaar.component';

@Component({
  selector: 'app-admin-layout',
  imports: [ CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NavbarComponent,
    SidebaarComponent,
    FooterComponent,],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent implements OnInit {
  isSidebarCollapsed = false;
  isSmallScreen = false;
  hideSidebar = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Check if route includes exam taking path
        this.hideSidebar = event.url.includes('/student/exam');
      });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isSmallScreen = window.innerWidth < 992;
    if (!this.isSmallScreen) {
      this.isSidebarCollapsed = false;
    }
  }
}
