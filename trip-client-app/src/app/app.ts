import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar-component/navbar-component';
import { ToastComponent } from './components/toast-component/toast-component';
import { SignalRService } from './services/signalR/signalr-service';
import { AuthService } from './services/auth/auth-service';
import { UserRole } from './models/auth.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly signalRService = inject(SignalRService);
  private readonly authService = inject(AuthService);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if(user?.role === UserRole.DRIVER) {
        this.signalRService.startConnection();
      } else {
        this.signalRService.stopConnection();
      }
    });
  }
}
