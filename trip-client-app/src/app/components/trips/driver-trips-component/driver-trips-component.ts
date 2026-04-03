import { Component, computed, inject, signal } from '@angular/core';
import { TripsService } from '../../../services/trips/trips-service';
import { Trip, TripFilter } from '../../../models/trip.model';
import { RouterLink } from "@angular/router";
import { PaginationService } from '../../../services/pagination/pagination-service';
import { PaginationComponent } from '../../pagination-component/pagination-component';
import { PagedResponse } from '../../../models/pagging.model';
import { TripCardComponent } from '../trip-card-component/trip-card-component';
import { UserRole } from '../../../models/auth.model';
import { AuthService } from '../../../services/auth/auth-service';
import { FilterBarComponent } from '../../filter-bar-component/filter-bar-component';
import { ToastService } from '../../../services/toast/toast-service';

@Component({
  selector: 'app-driver-trips-component',
  imports: [RouterLink, PaginationComponent, TripCardComponent, FilterBarComponent],
  templateUrl: './driver-trips-component.html',
  styleUrl: './driver-trips-component.scss',
})
export class DriverTripsComponent {
  private readonly tripService = inject(TripsService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly UserRole = UserRole;
  readonly trips = signal<Trip[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pagination = new PaginationService(2);
  readonly activeFilter = signal<TripFilter>({});

  readonly displayedTrips = computed(() => this.trips());

  constructor() {
    this.loadTrips();
  }

  handleFilterChange(rawValues: any): void {
    this.pagination.currentPage.set(1);

    this.activeFilter.set({
      from: rawValues.from || undefined,
      to: rawValues.to || undefined,
      date: rawValues.date || undefined,
      time: rawValues.time || undefined
    });

    this.loadTrips();
  }

  deleteTrip(tripId: string) {
    this.tripService.delete(tripId).subscribe({
      next: () => {
        this.trips.update(trips => trips.filter(t => t.id !== tripId));
        this.pagination.totalCount.update(total => total - 1);
        this.toastService.success('Trip deleted successfully.');
      },
      error: (err: unknown) => {
        this.error.set('Failed to delete trip. Please try again.');
        this.toastService.error('Failed to delete trip. Please try again.');
      }
    });
  }

  nextPage(): void { this.pagination.nextPage(() => this.loadTrips()); }
  previousPage(): void { this.pagination.previousPage(() => this.loadTrips()); }

  private loadTrips(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.toastService.error('No user logged in. Please log in again.');
      return;
    }

    const params: any = {};
    params.page = this.pagination.currentPage();
    params.pageSize = this.pagination.pageSize;
    params.driverId = user.id;

    if (this.activeFilter()?.from) params['from'] = this.activeFilter().from;
    if (this.activeFilter()?.to)   params['to']   = this.activeFilter().to;
    if (this.activeFilter()?.date) params['date'] = this.activeFilter().date;
    if (this.activeFilter()?.time) params['time'] = this.activeFilter().time;

    this.tripService.getAll(params).subscribe({
      next: (response: PagedResponse<Trip>) => {
        this.trips.set(response.items);
        this.isLoading.set(false);
        this.pagination.update(response.totalCount, response.hasNextPage, response.hasPreviousPage);
      },
      error: (err: unknown) => {
        this.error.set('Failed to load trips. Please try again.');
        this.isLoading.set(false);
        this.toastService.error('Failed to load trips. Please try again.');
      }
    });
  }
}
