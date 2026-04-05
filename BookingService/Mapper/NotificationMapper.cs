using BookingService.Entities;
using BookingService.Models.Booking;
using BookingService.Models.Notification;

namespace BookingService.Mapper
{
    public static class NotificationMapper
    {
        public static Notification ToEntity(this BookingConsumerRequestDto dto) => new()
        {
            Id = Guid.NewGuid(),
            DriverId = dto.DriverId,
            Message = $"New booking! {dto.PassengerName} booked {dto.From} → {dto.To}",
            IsRead = false,
            CreatedAt = DateTime.Now,
            BookingId = dto.BookingId
        };

        public static NotificationResponseDto ToResponseDto(this Notification notification) => new(
           notification.Id,
           notification.Message,
           notification.IsRead,
           notification.CreatedAt,
           notification.BookingId);
    }
}
