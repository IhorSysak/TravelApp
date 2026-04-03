import { Injectable } from '@angular/core';
import { Booking, CreateBookingRequest, UpdateBookingSeatsRequest, UpdateBookingStatusRequest } from '../../models/booking.model';
import { environment } from '../../environments/environment.development';
import { GenericService } from '../generic/generic-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookingsService extends GenericService<Booking, CreateBookingRequest> {
   
  constructor() {
    super(environment.bookingApiUrl);
  }
  
  updateSeats(id: string, request: UpdateBookingSeatsRequest): Observable<Booking> {
    const url = `${this.baseUrl}${id}/seats`;
    return this.http.patch<Booking>(url, request);
  }

  updateStatus(id: string, request: UpdateBookingStatusRequest): Observable<Booking> {
    const url = `${this.baseUrl}${id}/status`;
    return this.http.patch<Booking>(url, request);
  }
}