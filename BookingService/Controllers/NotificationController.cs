using BookingService.Context;
using BookingService.Mapper;
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
        private Guid DriverId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetAllAsync(CancellationToken cancellation)
        {
            var notifications = await context.Notifications.Where(n => n.DriverId == DriverId).OrderByDescending(n => n.CreatedAt).Select(n => n.ToResponseDto()).ToListAsync(cancellation);
            return Ok(notifications);
        }

        [HttpPatch("{id:guid}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellation)
        {
            var notification = await context.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.DriverId == DriverId, cancellation);
            if (notification is null) return NotFound();

            notification.IsRead = true;
            await context.SaveChangesAsync(cancellation);

            return Ok(notification.ToResponseDto());
        }

        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellation)
        {
            var notifications = await context.Notifications.Where(n => n.DriverId == DriverId && !n.IsRead).ToListAsync(cancellation);
            notifications.ForEach(n => n.IsRead = true);
            await context.SaveChangesAsync(cancellation);

            return Ok();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteAsync(Guid id, CancellationToken cancellation)
        {
            var notification = await context.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.DriverId == DriverId, cancellation);
            if (notification is null) return NotFound();

            context.Notifications.Remove(notification);
            await context.SaveChangesAsync(cancellation);
            
            return NoContent();
        }
    }
}