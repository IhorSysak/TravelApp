using BookingService.Entities;

namespace BookingService.Models.Booking
{
    public record BookingResponseDto(
        Guid Id,
        Guid DriverId,
        string DriverName,
        Guid TripId,
        Guid PassengerId,
        string PassengerName,
        string PassengerEmail,
        string From,
        string To,
        DateTime DepartureTime,
        int Seats,
        decimal TotalPrice,
        DateTime BookedAt,
        BookingStatus Status);
}