import { inject, Injectable } from '@angular/core';
import { ToastService } from '../toast/toast-service';
import { AuthService } from '../auth/auth-service';
import * as signalR from '@microsoft/signalr';
import { UserRole } from '../../models/auth.model';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../notifications/notification-service';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  private hubConnection: signalR.HubConnection | null = null;

  startConnection(): void {
    const user = this.authService.getCurrentUser();
    if(!user || user.role !== UserRole.DRIVER) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.signalRHubUrl, {
        accessTokenFactory: () => this.authService.getToken() ?? ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('NewBooking', (notification: any) => {
      this.toastService.info(notification.message);
      this.notificationService.markAsRead(notification.notificationId);
    });

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR connected');
        this.hubConnection!.invoke('JoinDriverGroup', user.id);
      })
      .catch(err => console.error('SignalR connection error:', err));
  }

  stopConnection(): void {
    if (this.hubConnection) {
      const user = this.authService.getCurrentUser();
      if(user) {
        this.hubConnection.invoke('LeaveDriverGroup', user.id).then(() => {
          this.hubConnection!.stop();
        });
      }
    }
  }
}
