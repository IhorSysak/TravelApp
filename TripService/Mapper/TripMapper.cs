using SharedLibrary.Models.Pagination;
using TripService.Entities;
using TripService.Models;

namespace TripService.Mapper
{
    public static class TripMapper
    {
        public static Trip ToEntity(this CreateTripDto dto) => new()
        {
            Id = Guid.NewGuid(),
            From = dto.From,
            To = dto.To,
            Description = dto.Description,
            DepartureTime = dto.DepartureTime,
            CarInfo = dto.CarInfo,
            PricePerSeat = dto.PricePerSeat,
            TotalSeats = dto.TotalSeats,
            AvailableSeats = dto.TotalSeats,
            DriverId = dto.DriverId,
            DriverName = dto.DriverName,
            CreatedAt = DateTime.Now,
            LastUpdatedAt = DateTime.Now
        };

        public static TripResponseDto ToResponseDto(this Trip trip) => new(
            trip.Id,
            trip.From,
            trip.To,
            trip.Description,
            trip.DepartureTime,
            trip.CarInfo,
            trip.PricePerSeat,
            trip.TotalSeats,
            trip.AvailableSeats,
            trip.DriverId,
            trip.DriverName,
            trip.CreatedAt,
            trip.LastUpdatedAt);

        public static void ApplyUpdate(this Trip trip, UpdateTripDto dto)
        {
            if (dto.From is not null)
                trip.From = dto.From;

            if (dto.To is not null)
                trip.To = dto.To;

            if (dto.Description is not null)
                trip.Description = dto.Description;

            if (dto.DepartureTime is not null)
                trip.DepartureTime = dto.DepartureTime.Value;

            if (dto.CarInfo is not null)
                trip.CarInfo = dto.CarInfo;

            if (dto.PricePerSeat is not null)
                trip.PricePerSeat = dto.PricePerSeat.Value;

            if (dto.TotalSeats is not null)
                trip.TotalSeats = dto.TotalSeats.Value;

            if (dto.AvailableSeats is not null)
                trip.AvailableSeats = dto.AvailableSeats.Value;

            trip.LastUpdatedAt = DateTime.UtcNow;
        }
    }
}
