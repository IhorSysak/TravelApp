import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Notification } from '../../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly http = inject(HttpClient);

  readonly notifications = signal<Notification[]>([]);
  readonly unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);
  readonly hasUnread = computed(() => this.unreadCount() > 0);

  addUnread(notifications: Notification[]): void {
    this.notifications.update(current => {
      const existingIds = new Set(current.map(n => n.id));
      const newOnes = notifications.filter(n => !existingIds.has(n.id));
      return [...newOnes, ...current];
    })    
  }

  addSingle(notification: Notification): void {
    this.notifications.update(current => [notification, ... current]);
  }

  loadAll(): void {
    this.http.get<Notification[]>(environment.notificationApiUrl).subscribe({
      next: notifications => this.notifications.set(notifications)
    });
  }

  markAsRead(id: string): void {
    this.http.patch<Notification>(environment.notificationApiUrl + `${id}/read`, {}).subscribe({
      next: updated => {
        this.notifications.update(list => list.map(n => n.id === id ? {...n, isRead: true} : n));
      } 
    });
  }

  markAllAsRead(): void {
    this.http.patch<Notification>(environment.notificationApiUrl + 'read-all', {}).subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true})));
      } 
    });
  }

  remove(id: string): void {
    this.http.delete(environment.notificationApiUrl + `${id}`).subscribe({
      next: () => {
        this.notifications.update(list => list.filter(n => n.id !== id));
      }
    });
  }
}
