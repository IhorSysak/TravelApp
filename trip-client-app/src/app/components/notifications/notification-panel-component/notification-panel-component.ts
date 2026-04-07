import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { NotificationService } from '../../../services/notifications/notification-service';
import { NotificationCardComponent } from '../notification-card-component/notification-card-component';

@Component({
  selector: 'app-notification-panel-component',
  imports: [NotificationCardComponent],
  templateUrl: './notification-panel-component.html',
  styleUrl: './notification-panel-component.scss',
})
export class NotificationPanelComponent {
  private readonly elementRef = inject(ElementRef);
  readonly notificationService = inject(NotificationService)
  readonly isOpen = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggle(event: Event): void {
    event.stopPropagation();
    this.isOpen.update(v => !v);

    if(this.isOpen()) {
      this.notificationService.loadAll();
    }
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  remove(id: string): void {
    this.notificationService.remove(id);
  }
}
