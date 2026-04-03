import { Component, input, output, signal } from '@angular/core';
import { UserRole } from '../../../models/auth.model';
import { Booking } from '../../../models/booking.model';

@Component({
  selector: 'app-booking-card-component',
  standalone: true,
  imports: [],
  templateUrl: './booking-card-component.html',
  styleUrl: './booking-card-component.scss',
})
export class BookingCardComponent {
  readonly UserRole = UserRole;

  readonly booking = input.required<Booking>();
  readonly mode = input.required<UserRole>();

  readonly cancelClick = output<string>();
  readonly approveClick = output<string>();

  readonly isExpanded = signal(false);

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  toggleDetails(): void {
    this.isExpanded.update(v => !v);
  }
}
