import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service';

@Component({
  selector: 'app-forbidden-component',
  imports: [],
  templateUrl: './forbidden-component.html',
  styleUrl: './forbidden-component.scss',
})
export class ForbiddenComponent {
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;

  goToDashboard(): void {
    this.authService.redirectBasedOnRole();
  }

  logout(): void {
    this.authService.logout();
  }
}
