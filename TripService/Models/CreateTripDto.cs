namespace TripService.Models
{
    public record CreateTripDto(
        string From,
        string To,
        string Description,
        DateTime DepartureTime,
        string CarInfo,
        decimal PricePerSeat,
        int TotalSeats,
        Guid DriverId,
        string DriverName);
}
