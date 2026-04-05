namespace BookingService.Models.Notification
{
    public record NotificationResponseDto(
        Guid Id,
        string Message,
        bool IsRead,
        DateTimeOffset CreatedAt,
        Guid? BookingId);
}
