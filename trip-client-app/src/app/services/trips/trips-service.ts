import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { CreateTripRequest, Trip, UpdateTripRequest } from '../../models/trip.model';
import { GenericService } from '../generic/generic-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TripsService extends GenericService<Trip, CreateTripRequest, UpdateTripRequest> {

  constructor() {
    super(environment.tripApiUrl);
  }

  updateAvailableSeats(id: string, remainingSeats: number): Observable<Trip> {
    const url = `${this.baseUrl}${id}/available-seats`;
    return this.http.patch<Trip>(url, { availableSeats: remainingSeats });
  }
}