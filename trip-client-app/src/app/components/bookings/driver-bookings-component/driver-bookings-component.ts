import { Component, computed, inject, signal } from '@angular/core';
import { PaginationComponent } from '../../pagination-component/pagination-component';
import { BookingCardComponent } from '../booking-card-component/booking-card-component';
import { PaginationService } from '../../../services/pagination/pagination-service';
import { FilterBarComponent } from '../../filter-bar-component/filter-bar-component';
import { AuthService } from '../../../services/auth/auth-service';
import { Booking, BookingFilter, BookingStatus } from '../../../models/booking.model';
import { switchMap, throwError } from 'rxjs';
import { BookingsService } from '../../../services/bookings/bookings-service';
import { PagedResponse } from '../../../models/pagging.model';
import { UserRole } from '../../../models/auth.model';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../services/toast/toast-service';
import { TripsService } from '../../../services/trips/trips-service';

@Component({
  selector: 'app-driver-bookings-component',
  imports: [PaginationComponent, BookingCardComponent, FilterBarComponent],
  templateUrl: './driver-bookings-component.html',
  styleUrl: './driver-bookings-component.scss',
})
export class DriverBookingsComponent {
  private readonly bookingsService = inject(BookingsService);
  private readonly tripService = inject(TripsService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  readonly UserRole = UserRole;
  readonly bookings = signal<Booking[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pagination = new PaginationService(2);
  readonly activeFilter = signal<BookingFilter>({});

  readonly displayedBookings = computed(() => this.bookings());

  constructor() {
    this.loadBookings();
  }

  handleFilterChange(rawValues: any): void {
    this.pagination.currentPage.set(1);

    this.activeFilter.set({
      from: rawValues.from || undefined,
      to: rawValues.to || undefined,
      date: rawValues.date || undefined,
      time: rawValues.time || undefined
    });

    this.loadBookings();
  }

  approveBooking(bookingId: string) {
    const bookingToCancel = this.bookings().find(b => b.id === bookingId);
    if (!bookingToCancel) return;

    this.isLoading.set(true);

    this.bookingsService.updateStatus(bookingId, { status: BookingStatus.CONFIRMED })
    .subscribe({
      next: () => {
        this.toastService.success('Booking approved successfully!');
        this.loadBookings();
      },
      error: (err: unknown) => {
        this.error.set('Failed to approve booking. Please try again.');
        this.toastService.error('Failed to approve booking. Please try again.');
      }
    });
  }

  cancelBooking(bookingId: string): void {
    const bookingToCancel = this.bookings().find(b => b.id === bookingId);
    if (!bookingToCancel) return;
  
    this.isLoading.set(true);
  
    this.bookingsService.updateStatus(bookingId, { status: BookingStatus.CANCELLED }).pipe(
      switchMap(() => this.tripService.getById(bookingToCancel.tripId)),
      switchMap((trip) => {
        const remainingSeats = trip.availableSeats + bookingToCancel.seats;
        return this.tripService.updateAvailableSeats(trip.id, remainingSeats);
      })
    ).subscribe({
      next: () => {
        this.toastService.success('Booking cancelled successfully!');
        this.loadBookings();
      },
      error: (err: unknown) => {
        this.error.set('Failed to cancel booking. Please try again.');
        this.toastService.error('Failed to cancel booking. Please try again.');
      }
    });
  }

  nextPage(): void { this.pagination.nextPage(() => this.loadBookings()); }
  previousPage(): void { this.pagination.previousPage(() => this.loadBookings()); }

  private loadBookings(): void {
      this.isLoading.set(true);
      this.error.set(null);
  
      const user = this.authService.getCurrentUser();
      if (!user) {
        throwError(() => new Error('No user logged in'));
        return;
      }
  
      const tripId = this.route.snapshot.paramMap.get('tripId');

      const params: any = {};
      params.page = this.pagination.currentPage();
      params.pageSize = this.pagination.pageSize;
      params.driverId = user.id;
  
      if(tripId) params['tripId'] = tripId;
      if (this.activeFilter()?.from) params['from'] = this.activeFilter().from;
      if (this.activeFilter()?.to)   params['to']   = this.activeFilter().to;
      if (this.activeFilter()?.date) params['date'] = this.activeFilter().date;
      if (this.activeFilter()?.time) params['time'] = this.activeFilter().time;
  
      this.bookingsService.getAll(params).subscribe({
        next: (response: PagedResponse<Booking>) => {
          this.bookings.set(response.items);
          this.isLoading.set(false);
          this.pagination.update(response.totalCount, response.hasNextPage, response.hasPreviousPage);
        },
        error: (err: unknown) => {
          this.error.set('Failed to load bookings. Please try again.');
          this.isLoading.set(false);
          this.toastService.error('Failed to load bookings. Please try again.');
        }
      });
    }
}
