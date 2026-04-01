namespace BookingService.Models.Booking
{
    public class BookingRequestDto
    {
        public Guid TripId { get; set; }
        public Guid PassengerId { get; set; }
        public required string PassengerName { get; set; }
        public required string PassengerEmail { get; set; }
        public Guid DriverId { get; set; }
        public string DriverName { get; set; } = string.Empty;
        public string From { get; set; } = string.Empty;
        public string To { get; set; } = string.Empty;
        public DateTime DepartureTime { get; set; }
        public int Seats { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
