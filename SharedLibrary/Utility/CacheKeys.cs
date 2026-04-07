namespace SharedLibrary.Utility
{
    public static class CacheKeys
    {
        public const string TripsPrefix = "trips";
        public static string TripById(Guid id) => $"trips:id:{id}";
        public static string TripsPage(string queryString) => $"trips:page:{queryString}";

        public const string BookingsPrefix = "bookings";
        public static string BookingById(Guid id) => $"bookings:id:{id}";
        public static string BookingsPage(string queryString) => $"bookings:page:{queryString}";

        public const string NotificationsPrefix = "notifications";
        public static string DriverNotifications(Guid driverId) => $"notifications:driver:{driverId}";
    }
}
