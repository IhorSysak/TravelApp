import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationEnd, Router } from '@angular/router';
import { UserRole } from '../../models/auth.model';
import { filter } from 'rxjs/operators';
import { NotificationPanelComponent } from '../notifications/notification-panel-component/notification-panel-component';

@Component({
  selector: 'app-navbar-component',
  imports: [RouterLink, RouterLinkActive, NotificationPanelComponent],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.scss',
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly visibleSignal = signal(true);

  readonly currentUser = this.authService.currentUser;

  readonly isDriver = computed(() => this.currentUser()?.role === UserRole.DRIVER);
  readonly isRegularUser = computed(() => this.currentUser()?.role === UserRole.USER);
  readonly showNavbar = computed(() => this.visibleSignal());

  constructor() {
    const blockedRoutes = ['/', '/login', '/register', '/forbidden'];

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        const isPageBlocked = blockedRoutes.includes(url);
        const isAuthenticated = this.authService.isAuthenticated();

        this.visibleSignal.set(isAuthenticated && !isPageBlocked);
      });
  }

  logout(): void {
    this.authService.logout();
  }
}