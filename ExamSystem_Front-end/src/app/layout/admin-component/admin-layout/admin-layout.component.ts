import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { SidebaarComponent } from '../../../shared/sidebaar/sidebaar.component';

import { Subscription } from 'rxjs';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebaarComponent, FooterComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  isSidebarCollapsed = false;
  isSmallScreen = false;

  private sidebarSub!: Subscription;
  private routerSub!: Subscription;

  constructor(private sidebarService: SidebarService, private router: Router) {}

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.checkScreenSize();

    this.sidebarSub = this.sidebarService.sidebarVisible$.subscribe(visible => {
      this.isSidebarCollapsed = !visible;
    });

    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const isExamPage = event.urlAfterRedirects.includes('/student/exam/');
        isExamPage ? this.sidebarService.hide() : this.sidebarService.show();
      }
    });
  }

  checkScreenSize() {
    this.isSmallScreen = window.innerWidth < 992;
    this.isSmallScreen ? this.sidebarService.hide() : this.sidebarService.show();
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  ngOnDestroy(): void {
    this.sidebarSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }
}
