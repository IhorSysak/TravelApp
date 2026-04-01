using BookingService.Entities;
using BookingService.Models.Booking;

namespace BookingService.Mapper
{
    public static class BookingMapper
    {
        public static Booking ToEntity(this BookingRequestDto dto) => new()
        {
            Id = Guid.NewGuid(),
            TripId = dto.TripId,
            PassengerId = dto.PassengerId,
            PassengerName = dto.PassengerName,
            PassengerEmail = dto.PassengerEmail,
            DriverId = dto.DriverId,
            DriverName = dto.DriverName,
            From = dto.From,
            To = dto.To,
            DepartureTime = dto.DepartureTime,
            Seats = dto.Seats,
            TotalPrice = dto.TotalPrice,
            Status = BookingStatus.Pending,
            BookedAt = DateTime.Now,
        };

        public static BookingResponseDto ToResponseDto(this Booking booking) => new(
           booking.Id,
           booking.TripId,
           booking.PassengerId,
           booking.PassengerName,
           booking.PassengerEmail,
           booking.DriverId,
           booking.DriverName,
           booking.From,
           booking.To,
           booking.DepartureTime,
           booking.Seats,
           booking.TotalPrice,
           booking.Status,
           booking.BookedAt);
    }
}
