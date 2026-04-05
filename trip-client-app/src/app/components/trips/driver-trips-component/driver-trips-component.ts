import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TripsService } from '../../../services/trips/trips-service';
import { Trip, TripFilter } from '../../../models/trip.model';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { PaginationService } from '../../../services/pagination/pagination-service';
import { PaginationComponent } from '../../pagination-component/pagination-component';
import { PagedResponse } from '../../../models/pagging.model';
import { TripCardComponent } from '../trip-card-component/trip-card-component';
import { UserRole } from '../../../models/auth.model';
import { FilterBarComponent } from '../../filter-bar-component/filter-bar-component';
import { ToastService } from '../../../services/toast/toast-service';

@Component({
  selector: 'app-driver-trips-component',
  imports: [RouterLink, PaginationComponent, TripCardComponent, FilterBarComponent],
  templateUrl: './driver-trips-component.html',
  styleUrl: './driver-trips-component.scss',
})
export class DriverTripsComponent implements OnInit {
  private readonly tripService = inject(TripsService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly UserRole = UserRole;
  readonly trips = signal<Trip[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pagination = new PaginationService(2);

  readonly displayedTrips = computed(() => this.trips());

  readonly initialFrom = signal('');
  readonly initialTo = signal('');
  readonly initialDate = signal('');
  readonly initialTime = signal('');
  readonly activeFilter = signal<TripFilter>({});

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
      this.loadTrips();
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

  nextPage(): void {
    this.updateUrl({ page: this.pagination.currentPage() + 1 });
  }

  previousPage(): void {
    this.updateUrl({ page: this.pagination.currentPage() - 1 });
  }

  private loadTrips(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const params: Record<string, any> = {
      page: this.pagination.currentPage(),
      pageSize: this.pagination.pageSize,
    };

    const filter = this.activeFilter();
    if (filter.from) params['from'] = filter.from;
    if (filter.to)   params['to']   = filter.to;
    if (filter.date) params['date'] = filter.date;
    if (filter.time) params['time'] = filter.time;

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
