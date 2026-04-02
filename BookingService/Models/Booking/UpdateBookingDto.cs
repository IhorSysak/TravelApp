namespace BookingService.Models.Booking
{
    public record UpdateBookingDto(
        int? Seats,
        decimal? TotalPrice);
}
