using Microsoft.EntityFrameworkCore;
using BookingService.Entities;

namespace BookingService.Context
{
    public class BookingContext(DbContextOptions<BookingContext> options) : DbContext(options)
    {
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TripId).IsRequired();
                entity.Property(e => e.PassengerId).IsRequired();
                entity.Property(e => e.PassengerName).IsRequired();
                entity.Property(e => e.PassengerEmail).IsRequired();
                entity.Property(e => e.DriverId).IsRequired();
                entity.Property(e => e.DriverName).IsRequired();
                entity.Property(e => e.From).IsRequired();
                entity.Property(e => e.To).IsRequired();
                entity.Property(e => e.DepartureTime).IsRequired();
                entity.Property(e => e.Seats).IsRequired();
                entity.Property(e => e.TotalPrice).IsRequired();
                entity.Property(e => e.Status).HasConversion<string>().IsRequired();
                entity.Property(e => e.BookedAt).IsRequired();

                entity.HasIndex(e => e.TripId);
            });
        }
    }
}