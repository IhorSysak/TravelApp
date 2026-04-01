namespace BookingService.Models.Trip
{
    public record TripDto(
        Guid Id,
        string Origin,
        string Destination,
        DateTime DepartureTime,
        int AvailableSeats,
        decimal Price);
}
