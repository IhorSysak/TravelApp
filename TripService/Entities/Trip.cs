namespace TripService.Entities
{
    public class Trip
    {
        public Guid Id { get; set; }
        public string From { get; set; } = string.Empty;
        public string To { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime DepartureTime { get; set; }
        public string CarInfo { get; set; } = string.Empty;
        public decimal PricePerSeat { get; set; }
        public int TotalSeats { get; set; }
        public int AvailableSeats { get; set; }
        public Guid DriverId { get; set; }
        public string DriverName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime LastUpdatedAt { get; set; }
    }
}
