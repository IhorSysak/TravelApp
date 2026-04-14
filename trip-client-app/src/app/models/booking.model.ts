export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled'
}

export interface Booking {
  id: string;
  tripId: string;
  passengerId: string;
  passengerName: string;
  passengerEmail: string;
  driverId: string;
  driverName: string;
  from: string;
  to: string;
  departureTime: string;
  seats: number;
  totalPrice: number;
  status: BookingStatus;
  bookedAt: string;
}

export interface CreateBookingRequest {
  tripId: string;
  passengerId: string;
  passengerName: string;
  passengerEmail: string;
  driverId: string;
  driverName: string;
  from: string;
  to: string;
  departureTime: string;
  seats: number;
  totalPrice: number;
}

export interface UpdateBookingSeatsRequest {
  seats: number;
  totalPrice: number;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
}

export interface StatusChangedModel {
  message: string;
  status: BookingStatus;
}

export interface BookingFilter {
  from?: string;
  to?: string;
  date?: string;
  time?: string;
}