namespace TripService.Models
{
    public record UpdateTripDto(
         string? From,
         string? To,
         string? Description,
         DateTime? DepartureTime,
         string? CarInfo,
         decimal? PricePerSeat,
         int? TotalSeats,
         int? AvailableSeats);
}
