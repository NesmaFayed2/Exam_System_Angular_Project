import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebaarComponent } from '../../shared/sidebaar/sidebaar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NavbarComponent,
    SidebaarComponent,
    FooterComponent
  ]
})
export class DashboardLayoutComponent implements OnInit{
  
  isSidebarCollapsed = false;
  isSmallScreen = false;
  hideSidebar = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
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

