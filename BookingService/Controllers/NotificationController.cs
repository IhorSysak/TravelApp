using BookingService.Context;
using BookingService.Mapper;
using BookingService.Models.Notification;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Services;
using SharedLibrary.Utility;
using System.Security.Claims;

namespace BookingService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = RoleConstants.Driver)]
    public class NotificationController(BookingContext context, ICacheService cache) : ControllerBase
    {
        private Guid DriverId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetAllAsync(CancellationToken cancellation)
        {
            var cacheKey = CacheKeys.DriverNotifications(DriverId);
            var cached = await cache.GetAsync<List<NotificationResponseDto>>(cacheKey, cancellation);
            if (cached is not null)
                return Ok(cached);

            var notifications = await context.Notifications.Where(n => n.DriverId == DriverId).OrderByDescending(n => n.CreatedAt).Select(n => n.ToResponseDto()).ToListAsync(cancellation);

            await cache.SetAsync(cacheKey, notifications, TimeSpan.FromMinutes(2), cancellation);

            return Ok(notifications);
        }

        [HttpPatch("{id:guid}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellation)
        {
            var notification = await context.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.DriverId == DriverId, cancellation);
            if (notification is null) return NotFound();

            notification.IsRead = true;
            await context.SaveChangesAsync(cancellation);

            await cache.RemoveAsync(CacheKeys.DriverNotifications(DriverId), cancellation);

            return Ok(notification.ToResponseDto());
        }

        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellation)
        {
            var notifications = await context.Notifications.Where(n => n.DriverId == DriverId && !n.IsRead).ToListAsync(cancellation);
            notifications.ForEach(n => n.IsRead = true);
            await context.SaveChangesAsync(cancellation);

            await cache.RemoveAsync(CacheKeys.DriverNotifications(DriverId), cancellation);

            return Ok();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteAsync(Guid id, CancellationToken cancellation)
        {
            var notification = await context.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.DriverId == DriverId, cancellation);
            if (notification is null) return NotFound();

            context.Notifications.Remove(notification);
            await context.SaveChangesAsync(cancellation);

            await cache.RemoveAsync(CacheKeys.DriverNotifications(DriverId), cancellation);

            return NoContent();
        }
    }
}