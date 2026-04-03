export interface Trip {
  id: string;
  from: string;
  to: string;
  description?: string;
  departureTime: string;
  carInfo?: string;
  pricePerSeat: number;
  totalSeats: number;
  availableSeats: number;
  driverId: string;
  driverName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripRequest {
  from: string;
  to: string;
  description?: string;
  departureTime: string;
  carInfo?: string;
  pricePerSeat: number;
  totalSeats: number;
  driverId: string;
  driverName: string;
}

export type UpdateTripRequest = Partial<CreateTripRequest> & {
  availableSeats?: number;
};

export interface TripFilter {
  from?: string;
  to?: string;
  date?: string;
  time?: string;
}