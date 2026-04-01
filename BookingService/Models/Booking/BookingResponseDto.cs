using BookingService.Entities;

namespace BookingService.Models.Booking
{
    public record BookingResponseDto(
        Guid Id,
        Guid TripId,
        Guid PassengerId,
        string PassengerName,
        string PassengerEmail,
        Guid DriverId,
        string DriverName,
        string From,
        string To,
        DateTime DepartureTime,
        int Seats,
        decimal TotalPrice,
        BookingStatus Status,
        DateTime BookedAt);
}