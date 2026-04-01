using Microsoft.EntityFrameworkCore;
using TripService.Entities;

namespace TripService.Context
{
    public class TripContext(DbContextOptions<TripContext> options) : DbContext(options)
    {
        public DbSet<Trip> Trips { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Trip>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.From).IsRequired();
                entity.Property(e => e.To).IsRequired();
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.DepartureTime).IsRequired();
                entity.Property(e => e.CarInfo).IsRequired();
                entity.Property(e => e.PricePerSeat).IsRequired().HasColumnType("decimal(10,2)");
                entity.Property(e => e.TotalSeats).IsRequired();
                entity.Property(e => e.AvailableSeats).IsRequired();
                entity.Property(e => e.DriverId).IsRequired();
                entity.Property(e => e.DriverName).IsRequired();             
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.LastUpdatedAt).IsRequired();
            });
        }
    }
}
