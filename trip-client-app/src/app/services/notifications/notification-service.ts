import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly http = inject(HttpClient);

  markAsRead(notificationId: string): void {
    this.http.patch(environment.notificationApiUrl + `${notificationId}/read`, {}).subscribe({
      next: () => console.log(`Notification ${notificationId} marked as read`),
      error: err => console.error(`Failed to mark notification ${notificationId} as read:`, err)
    });
  }
}
