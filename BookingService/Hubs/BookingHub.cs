using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SharedLibrary.Utility;

namespace BookingService.Hubs
{
    [Authorize(Roles = RoleConstants.Driver)]
    public class BookingHub : Hub
    {
        public async Task JoinDriverGroup(string driverId) 
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"driver-{driverId}");
        }

        public async Task LeaveDriverGroup(string driverId) 
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"driver-{driverId}");
        }
    }
}
