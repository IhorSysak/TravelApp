import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Trip } from '../../../models/trip.model';
import { BookingsService } from '../../../services/bookings/bookings-service';
import { AuthService } from '../../../services/auth/auth-service';
import { FormsModule } from "@angular/forms";
import { CreateBookingRequest } from '../../../models/booking.model';
import { ToastService } from '../../../services/toast/toast-service';
import { switchMap } from 'rxjs';
import { TripsService } from '../../../services/trips/trips-service';

@Component({
  selector: 'app-booking-form-component',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './booking-form-component.html',
  styleUrl: './booking-form-component.scss',
})
export class BookingFormComponent {
  private readonly bookingService = inject(BookingsService);
  private readonly tripService = inject(TripsService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly trip = input.required<Trip>();

  readonly cancel = output<void>();
  readonly success = output<void>();

  readonly seats = signal<number>(1);
  readonly isSubmitting = signal(false);

  readonly totalPrice = computed(() => this.seats() * this.trip().pricePerSeat);

  confirmBooking(): void {
    const trip = this.trip();
    const user = this.authService.getCurrentUser();

    if(!trip || !user) return;

    this.isSubmitting.set(true);

    const request: CreateBookingRequest = {
      tripId: trip.id,
      passengerId: user.id,
      passengerName: user.firstName,
      passengerEmail: user.email,
      driverId: trip.driverId,
      driverName: trip.driverName,
      from: trip.from,
      to: trip.to,
      departureTime: trip.departureTime,
      seats: this.seats(),
      totalPrice: this.totalPrice()
    };

    this.bookingService.create(request).pipe(
       switchMap(() => {
          const remainingSeats = trip.availableSeats - this.seats();
          return this.tripService.updateAvailableSeats(trip.id, remainingSeats);
       })
    ).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.success.emit();
        this.toastService.success('Booking successful!');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastService.error('Booking failed. Please try again.');
      }
    });
  }
}
