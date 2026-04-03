import { Component, computed, inject, signal } from '@angular/core';
import { UserRole } from '../../../models/auth.model';
import { Booking, BookingFilter, BookingStatus } from '../../../models/booking.model';
import { AuthService } from '../../../services/auth/auth-service';
import { BookingsService } from '../../../services/bookings/bookings-service';
import { PaginationService } from '../../../services/pagination/pagination-service';
import { FilterBarComponent } from '../../filter-bar-component/filter-bar-component';
import { PaginationComponent } from '../../pagination-component/pagination-component';
import { BookingCardComponent } from '../booking-card-component/booking-card-component';
import { PagedResponse } from '../../../models/pagging.model';
import { switchMap, throwError } from 'rxjs';
import { ToastService } from '../../../services/toast/toast-service';
import { TripsService } from '../../../services/trips/trips-service';

@Component({
  selector: 'app-user-bookings-component',
  imports: [PaginationComponent, BookingCardComponent, FilterBarComponent],
  templateUrl: './user-bookings-component.html',
  styleUrl: './user-bookings-component.scss',
})
export class UserBookingsComponent {
  private readonly bookingsService = inject(BookingsService);
  private readonly tripService = inject(TripsService);
  private readonly authService = inject(AuthService);
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
          //this.bookings.update(bookings => bookings.filter(b => b.id !== bookingId));
          //this.pagination.totalCount.update(total => total - 1);
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
    
        const params: any = {};
        params.page = this.pagination.currentPage();
        params.pageSize = this.pagination.pageSize;

        if(user.role === UserRole.DRIVER) {
          params.driverId = user.id;
        } else {
          params.passengerId = user.id;
        }
    
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
