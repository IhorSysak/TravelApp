using BookingService.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Utility;

namespace BookingService.Hubs
{
    [Authorize(Roles = RoleConstants.Driver)]
    public class BookingHub(BookingContext dbContext) : Hub
    {
        public async Task JoinDriverGroup(string driverId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"driver-{driverId}");

            var driverGuid = Guid.Parse(driverId);
            var unread = await dbContext.Notifications.Where(n => n.DriverId == driverGuid && !n.IsRead).OrderBy(n => n.CreatedAt).ToListAsync();

            foreach (var notificaton in unread) 
            {
                await Clients.Caller.SendAsync("NewBooking", new
                {
                    NotificationId = notificaton.Id,
                    notificaton.Message,
                    notificaton.CreatedAt,
                    notificaton.BookingId
                });
            }
        }

        public async Task LeaveDriverGroup(string driverId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"driver-{driverId}");
        }
    }
}
