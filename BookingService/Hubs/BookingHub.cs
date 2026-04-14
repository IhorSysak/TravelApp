using BookingService.Context;
using BookingService.Mapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BookingService.Hubs
{
    [Authorize]
    public class BookingHub(BookingContext dbContext) : Hub
    {
        private Guid UserId => Guid.Parse(Context?.User?.FindFirstValue(ClaimTypes.NameIdentifier)!);

        public async Task JoinDriverGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"driver-{UserId}");

            var unread = await dbContext.Notifications.Where(n => n.DriverId == UserId && !n.IsRead).OrderBy(n => n.CreatedAt).Select(n => n.ToResponseDto()).ToListAsync();

            if (unread.Count != 0) await Clients.Caller.SendAsync("UnreadNotifications", unread);
        }

        public async Task LeaveDriverGroup()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"driver-{UserId}");
        }

        public async Task JoinPassengerGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"passenger-{UserId}");
        }

        public async Task LeavePassengerGroup()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"passenger-{UserId}");
        }
    }
}
