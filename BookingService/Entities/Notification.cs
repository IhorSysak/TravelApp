namespace BookingService.Entities
{
    public class Notification
    {
        public Guid Id { get; set; }
        public Guid DriverId { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTimeOffset CreatedAt { get; set; }
        public Guid? BookingId { get; set; }
    }
}
