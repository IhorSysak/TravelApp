import { inject, Injectable } from '@angular/core';
import { ToastService } from '../toast/toast-service';
import { AuthService } from '../auth/auth-service';
import * as signalR from '@microsoft/signalr';
import { UserRole } from '../../models/auth.model';
import { environment } from '../../environments/environment.development';
import { NotificationService } from '../notifications/notification-service';
import { Notification } from '../../models/notification.model';
import { BookingStatus, StatusChangedModel } from '../../models/booking.model';
import { ToastType } from '../../models/toast.model';

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
    if(!user) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.signalRHubUrl, {
        accessTokenFactory: () => this.authService.getToken() ?? ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('UnreadNotifications', (notifications: Notification[]) => {
      this.notificationService.addUnread(notifications);
    });

    this.hubConnection.on('NewBooking', (notification: Notification) => {
      this.toastService.info(notification.message);
      this.notificationService.addSingle(notification);
    });

    this.hubConnection.on('BookingStatusChanged', (data: StatusChangedModel) => {
      const statusMap: Record<BookingStatus, ToastType> = {
        [BookingStatus.CONFIRMED]: 'success',
        [BookingStatus.CANCELLED]: 'warning',
        [BookingStatus.REJECTED]: 'error',
        [BookingStatus.PENDING]: 'info',
      };

      const toastType = statusMap[data.status] ?? 'info';

      this.toastService.showToast(data.message, toastType, 6000);
    });

    this.hubConnection.start()
      .then(() => {
        if(user.role === UserRole.DRIVER) {
          this.hubConnection!.invoke('JoinDriverGroup');
        } else {
          this.hubConnection!.invoke('JoinPassengerGroup');
        }
      })
      .catch(err => console.error('SignalR connection error:', err));
  }

  stopConnection(): void {
    const user = this.authService.getCurrentUser();
    if (!this.hubConnection || !user) return;

    const leaveMethod = user.role === UserRole.DRIVER ? 'LeaveDriverGroup' : 'LeavePassengerGroup';

    this.hubConnection.invoke(leaveMethod, user.id).then(() => {
      this.hubConnection!.stop();
    });
  }
}
