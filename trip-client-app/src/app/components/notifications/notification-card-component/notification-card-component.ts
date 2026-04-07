import { Component, input, output } from '@angular/core';
import { Notification } from '../../../models/notification.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-notification-card-component',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './notification-card-component.html',
  styleUrl: './notification-card-component.scss',
})
export class NotificationCardComponent {
  readonly notification = input.required<Notification>();

  readonly markAsReadClick = output<string>();
  readonly removeClick = output<string>();
}
