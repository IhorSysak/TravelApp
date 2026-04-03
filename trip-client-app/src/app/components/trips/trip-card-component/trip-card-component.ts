import { Component, input, output, signal } from '@angular/core';
import { Trip } from '../../../models/trip.model';
import { UserRole } from '../../../models/auth.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-trip-card-component',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './trip-card-component.html',
  styleUrl: './trip-card-component.scss',
})
export class TripCardComponent {
  readonly UserRole = UserRole;
  
  readonly trip = input.required<Trip>();
  readonly mode = input.required<UserRole>();

  readonly deleteClick = output<string>();
  readonly bookClick = output<Trip>();

  readonly isExpanded = signal(false);

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  getBookedSeats(): number {
    return this.trip().totalSeats - this.trip().availableSeats;
  }

  toggleDetails(): void {
    this.isExpanded.update(v => !v);
  }
}
