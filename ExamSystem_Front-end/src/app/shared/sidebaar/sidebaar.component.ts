import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebaar',
  standalone: true,
  templateUrl: './sidebaar.component.html',
  styleUrls: ['./sidebaar.component.css'],
  imports: [RouterLink, RouterLinkActive]
})
export class SidebaarComponent {
  constructor(private authService: AuthService) {}

  onLogOut(): void {
    this.authService.logout();
  }
}
