import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PaginationComponent } from '../../pagination-component/pagination-component';
import { BookingCardComponent } from '../booking-card-component/booking-card-component';
import { PaginationService } from '../../../services/pagination/pagination-service';
import { FilterBarComponent } from '../../filter-bar-component/filter-bar-component';
import { Booking, BookingFilter, BookingStatus } from '../../../models/booking.model';
import { switchMap } from 'rxjs';
import { BookingsService } from '../../../services/bookings/bookings-service';
import { PagedResponse } from '../../../models/pagging.model';
import { UserRole } from '../../../models/auth.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast/toast-service';
import { TripsService } from '../../../services/trips/trips-service';

@Component({
  selector: 'app-driver-bookings-component',
  imports: [PaginationComponent, BookingCardComponent, FilterBarComponent],
  templateUrl: './driver-bookings-component.html',
  styleUrl: './driver-bookings-component.scss',
})
export class DriverBookingsComponent implements OnInit {
  private readonly bookingsService = inject(BookingsService);
  private readonly tripService = inject(TripsService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly UserRole = UserRole;
  readonly bookings = signal<Booking[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pagination = new PaginationService(2);

  readonly displayedBookings = computed(() => this.bookings());

  readonly initialFrom = signal('');
  readonly initialTo = signal('');
  readonly initialDate = signal('');
  readonly initialTime = signal('');
  readonly activeFilter = signal<BookingFilter>({});

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const from  = params['from']  ?? '';
      const to    = params['to']    ?? '';
      const date  = params['date']  ?? '';
      const time  = params['time']  ?? '';
      const page  = Number(params['page'] ?? 1);

      this.initialFrom.set(from);
      this.initialTo.set(to);
      this.initialDate.set(date);
      this.initialTime.set(time);

      this.activeFilter.set({
        from: from || undefined,
        to: to || undefined,
        date: date || undefined,
        time: time || undefined
      });

      this.pagination.currentPage.set(page);
      this.loadBookings();
    });
  }

  handleFilterChange(rawValues: { from?: string; to?: string; date?: string; time?: string }): void {
    this.updateUrl({
      from: rawValues.from || null,
      to: rawValues.to || null,
      date: rawValues.date || null,
      time: rawValues.time || null,
      page: 1
    });
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

  nextPage(): void {
    this.updateUrl({ page: this.pagination.currentPage() + 1 });
  }

  previousPage(): void {
    this.updateUrl({ page: this.pagination.currentPage() - 1 });
  }

  private loadBookings(): void {
    this.isLoading.set(true);
    this.error.set(null);
  
    const tripId = this.route.snapshot.paramMap.get('tripId');
    const params: Record<string, any> = {
      page: this.pagination.currentPage(),
      pageSize: this.pagination.pageSize,
    };
  
    const filter = this.activeFilter();
    if (filter.from) params['from']   = filter.from;
    if (filter.to)   params['to']     = filter.to;
    if (filter.date) params['date']   = filter.date;
    if (filter.time) params['time']   = filter.time;
    if(tripId)       params['tripId'] = tripId;
  
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

  private updateUrl(overrides: {from?: string | null; to?: string | null; date?: string | null; time?: string | null; page?: number | null;}): void {
    const page = overrides.page ?? this.pagination.currentPage();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        from: overrides.from !== undefined ? overrides.from : this.activeFilter().from ?? null,
        to:   overrides.to   !== undefined ? overrides.to   : this.activeFilter().to   ?? null,
        date: overrides.date !== undefined ? overrides.date : this.activeFilter().date ?? null,
        time: overrides.time !== undefined ? overrides.time : this.activeFilter().time ?? null,
        page:  page > 1 ? page : null,
      }
    });
  }
}
