export interface BookingNotification {
    tripId: number;
    passengerName: string;
    passengerEmail: string;
    from: string;
    to: string;
    seats: number;
    totalPrice: number;
}