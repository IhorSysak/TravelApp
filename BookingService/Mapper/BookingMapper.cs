using BookingService.Entities;
using BookingService.Models.Booking;
using SharedLibrary.Models.Pagination;

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
            From = dto.From,
            To = dto.To,
            DepartureTime = dto.DepartureTime,
            Seats = dto.Seats,
            TotalPrice = dto.TotalPrice,
            DriverId = dto.DriverId,
            DriverName = dto.DriverName,
            BookedAt = DateTime.Now,
            Status = BookingStatus.Pending
        };

        public static BookingResponseDto ToResponseDto(this Booking booking) => new(
           booking.Id,
           booking.DriverId,
           booking.DriverName,
           booking.TripId,
           booking.PassengerId,
           booking.PassengerName,
           booking.PassengerEmail,
           booking.From,
           booking.To,
           booking.DepartureTime,
           booking.Seats,
           booking.TotalPrice,
           booking.BookedAt,
           booking.Status);
    }
}
