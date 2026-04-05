using BookingService.Context;
using BookingService.Mapper;
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
            var unread = await dbContext.Notifications.Where(n => n.DriverId == driverGuid && !n.IsRead).OrderBy(n => n.CreatedAt).Select(n => n.ToResponseDto()).ToListAsync();

            if (unread.Count != 0) await Clients.Caller.SendAsync("UnreadNotifications", unread);
        }

        public async Task LeaveDriverGroup(string driverId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"driver-{driverId}");
        }
    }
}
