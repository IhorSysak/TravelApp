import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TripsService } from '../../../services/trips/trips-service';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateTripRequest, Trip } from '../../../models/trip.model';
import { AuthService } from '../../../services/auth/auth-service';
import { ToastService } from '../../../services/toast/toast-service';

@Component({
  selector: 'app-trip-form-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './trip-form-component.html',
  styleUrl: './trip-form-component.scss',
})
export class TripFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tripService = inject(TripsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute)
  private readonly toastService = inject(ToastService);

  readonly tripForm: FormGroup;
  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly tripId = signal<string | null>(null);

  constructor() {
    this.tripForm = this.fb.group({
      from:          ['', [Validators.required, Validators.minLength(2)]],
      to:            ['', [Validators.required, Validators.minLength(2)]],
      departureDate: ['', [Validators.required]],
      departureTime: ['', [Validators.required]],
      totalSeats:    [4, [Validators.required, Validators.min(1), Validators.max(8)]],
      pricePerSeat:  [0, [Validators.required, Validators.min(0)]],
      description:   [''],
      carInfo:       ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if(id) {
      this.isEditMode.set(true);
      this.tripId.set(id);
      this.loadTrip(id);
    }
  }

  onSubmit() {
      if(this.tripForm.invalid) {
        this.markFormGroupTouched();
        return;
      }
  
      this.isSubmitting.set(true);
      this.error.set(null);

      const currentUser = this.authService.currentUser();
      if(currentUser == null) {
        this.toastService.error('User not authenticated. Please log in again.');
        this.isSubmitting.set(false);
        return;
      }

      const formValue = this.tripForm.value;
      const request: CreateTripRequest = {
        ...formValue,
        departureTime: this.combineDateAndTime(formValue.departureDate, formValue.departureTime),
        driverId: currentUser.id,
        driverName: currentUser.firstName
      };

      const operation = this.isEditMode()
        ? this.tripService.update(this.tripId()!, request)
        : this.tripService.create(request);

      operation.subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/driver/trips']);
          this.toastService.success(`Trip ${this.isEditMode() ? 'updated' : 'created'} successfully!`);
        },
        error: (err: unknown) => {
          this.error.set(`Failed to ${this.isEditMode() ? 'update' : 'create'} trip. Please try again.`);
          this.isSubmitting.set(false);
          this.toastService.error(`Failed to ${this.isEditMode() ? 'update' : 'create'} trip. Please try again.`);
        }
      })
    }

  onCancel() : void {
    this.router.navigate(['/driver/trips']);
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  hasFieldError(controlName: string): boolean {
    const control = this.tripForm.get(controlName);
    return !!(control?.invalid && control?.touched)
  }

  getErrorMessage(controlName: string): string {
    const control = this.tripForm.get(controlName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(controlName)} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${this.getFieldLabel(controlName)} must be at least ${control.errors?.['minlength']?.requiredLength} characters`;
    }
    if (control?.hasError('min')) {
      return `${this.getFieldLabel(controlName)} must be at least ${control.errors?.['min']?.min}`;
    }
    if (control?.hasError('max')) {
      return `${this.getFieldLabel(controlName)} cannot exceed ${control.errors?.['max']?.max}`;
    }
    return '';
  }

  private loadTrip(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.tripService.getById(id).subscribe({
      next: (trip: Trip) => {
        const { date, time } = this.splitDepartureTime(trip.departureTime);
        this.tripForm.patchValue({
          from: trip.from,
          to: trip.to,
          departureDate: date,
          departureTime: time,
          totalSeats: trip.totalSeats,
          pricePerSeat: trip.pricePerSeat,
          description: trip.description || '',
          carInfo: trip.carInfo || ''
        });
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.error.set('Failed to load trip details. Please try again.');
        this.isLoading.set(false);
        this.toastService.error('Failed to load trip details. Please try again.');
      }
    });
  }

  private splitDepartureTime(departureTime: string): { date: string; time: string} {
    const dt = new Date(departureTime);
    return {
      date: dt.toISOString().split('T')[0],
      time: dt.toTimeString().substring(0, 5)
    }
  }

  private combineDateAndTime(date: string, time: string): string {
    return `${date}T${time}:00`;
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      from: 'Departure city',
      to: 'Destination city',
      departureDate: 'Departure date',
      departureTime: 'Departure time',
      totalSeats: 'Total seats',
      pricePerSeat: 'Price per seat',
      description: 'Description',
      carInfo: 'Car information'
    }

    return labels[controlName] || controlName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.tripForm.controls).forEach(key => {
      const control = this.tripForm.get(key);
      control?.markAsTouched();
    })
  }
}
