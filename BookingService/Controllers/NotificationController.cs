using BookingService.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Utility;
using System.Security.Claims;

namespace BookingService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = RoleConstants.Driver)]
    public class NotificationController(BookingContext context) : ControllerBase
    {
        [HttpGet("unread")]
        public async Task<IActionResult> GetUnread(CancellationToken cancellation)
        {
            var driverId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var notifications = await context.Notifications.Where(n => n.DriverId == driverId && !n.IsRead).OrderByDescending(n => n.CreatedAt).ToListAsync(cancellation);

            return Ok(notifications);
        }

        [HttpPatch("{id:guid}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellation)
        {
            var driverId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var notification = await context.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.DriverId == driverId, cancellation);
            if (notification is null) return NotFound();

            notification.IsRead = true;
            await context.SaveChangesAsync(cancellation);

            return NoContent();
        }

        public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellation)
        {
            var driverId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var notifications = await context.Notifications.Where(n => n.DriverId == driverId && !n.IsRead).ToListAsync(cancellation);
            foreach (var notification in notifications) 
                notification.IsRead = true;

            await context.SaveChangesAsync(cancellation);

            return NoContent();
        }
    }
}