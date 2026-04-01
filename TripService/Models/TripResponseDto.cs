namespace TripService.Models
{
    public record TripResponseDto(
        Guid Id,
        string From,
        string To,
        string Description,
        DateTime DepartureTime,
        string CarInfo,
        decimal PricePerSeat,
        int TotalSeats,
        int AvailableSeats,
        Guid DriverId,
        string DriverName,
        DateTime CreatedAt,
        DateTime LastUpdatedAt);
}
