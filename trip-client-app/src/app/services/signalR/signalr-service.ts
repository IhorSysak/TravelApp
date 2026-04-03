import { inject, Injectable } from '@angular/core';
import { ToastService } from '../toast/toast-service';
import { AuthService } from '../auth/auth-service';
import * as signalR from '@microsoft/signalr';
import { UserRole } from '../../models/auth.model';
import { environment } from '../../environments/environment.development';
import { BookingNotification } from '../../models/bookingNotification.model';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

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

    this.hubConnection.on('NewBooking', (booking: BookingNotification) => {
      this.toastService.info(`New booking! ${booking.passengerName} booked ${booking.seats} seat(s) from ${booking.from} to ${booking.to}. Total price: $${booking.totalPrice}`);
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
