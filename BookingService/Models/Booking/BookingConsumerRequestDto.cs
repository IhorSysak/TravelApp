namespace BookingService.Models.Booking
{
    public record BookingConsumerRequestDto(
        Guid BookingId,
        string PassengerName,
        Guid DriverId,
        string From,
        string To);
}
