using BookingService.Entities;
using BookingService.Mapper;
using BookingService.Messaging;
using BookingService.Models.Booking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Models.Pagination;
using SharedLibrary.Repositories;
using SharedLibrary.Utility;
using System.Security.Claims;

namespace BookingService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookingsController(
        ILogger<BookingsController> logger,
        IMessageProducer messageProducer,
        IGenericRepository<Booking> bookingRepo) : ControllerBase
    {
        [HttpGet]
        [Authorize(Roles = $"{RoleConstants.Driver},{RoleConstants.User}")]
        public async Task<IActionResult> GetAllAsync([FromQuery] BookingFilterRequestDto requestDto, CancellationToken cancellation)
        {
            var pagedRequest = requestDto.ToPagedRequest();

            var query = bookingRepo.GetQueryable();

            if (User.IsInRole(RoleConstants.Driver))
                query = query.Where(t => t.DriverId == Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!));

            if (User.IsInRole(RoleConstants.User))
                query = query.Where(t => t.PassengerId == Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!));

            if (requestDto.TripId.HasValue)
                query = query.Where(t => t.TripId == requestDto.TripId.Value);

            if (!string.IsNullOrEmpty(requestDto.From))
                query = query.Where(t => t.From.ToLower().Contains(requestDto.From.Trim().ToLower()));

            if (!string.IsNullOrEmpty(requestDto.To))
                query = query.Where(t => t.To.ToLower().Contains(requestDto.To.Trim().ToLower()));

            if (requestDto.Date.HasValue)
            {
                var date = requestDto.Date.Value;
                query = query.Where(t =>
                    t.DepartureTime.Year  == date.Year  &&
                    t.DepartureTime.Month == date.Month &&
                    t.DepartureTime.Day   == date.Day);
            }

            if (requestDto.Time.HasValue)
            {
                var time = requestDto.Time.Value;
                query = query.Where(t =>
                    t.DepartureTime.Hour   == time.Hour &&
                    t.DepartureTime.Minute == time.Minute);
            }

            var bookings = await bookingRepo.GetPagedAsync(pagedRequest, query, cancellation: cancellation);

            var response = new PagedResponse<BookingResponseDto>(
                Items: bookings.Items.Select(t => t.ToResponseDto()),
                Page: bookings.Page,
                PageSize: bookings.PageSize,
                TotalCount: bookings.TotalCount,
                TotalPages: bookings.TotalPages);

            return Ok(response);
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = $"{RoleConstants.Driver},{RoleConstants.User}")]
        public async Task<IActionResult> GetByIdAsync(Guid id, CancellationToken cancellation)
        {
            var booking = await bookingRepo.GetByIdAsync(id, cancellation);
            return booking is null ? NotFound() : Ok(booking.ToResponseDto());
        }

        [HttpPost]
        [Authorize(Roles = RoleConstants.User)]
        public async Task<IActionResult> CreateAsync(BookingRequestDto request, CancellationToken cancellation)
        {
            logger.LogInformation("Send booking request: {request}", request);

            var created = await bookingRepo.CreateAsync(request.ToEntity(), cancellation);
            await messageProducer.SendingMessageAsync(created.ToConsumerRequestDto());

            logger.LogInformation("Booking sent for trip {TripId} by {Passenger}", request.TripId, request.PassengerName);

            return Ok(created.ToResponseDto());
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = RoleConstants.User)]
        public async Task<IActionResult> UpdateAsync(Guid id, UpdateBookingDto dto, CancellationToken cancellation)
        {
            var existing = await bookingRepo.GetByIdAsync(id, cancellation);
            if (existing is null) return NotFound();

            existing.ApplyUpdate(dto);

            var updated = await bookingRepo.UpdateAsync(existing, cancellation);
            return Ok(updated?.ToResponseDto());
        }

        [HttpPatch("{id:guid}/seats")]
        [Authorize(Roles = RoleConstants.User)]
        public async Task<IActionResult> UpdateSeatsAsync(Guid id, UpdateBookingSeatsDto dto, CancellationToken cancellation)
        {
            var booking = await bookingRepo.GetByIdAsync(id, cancellation);
            if (booking == null) return NotFound();

            booking.Seats = dto.Seats;
            booking.TotalPrice = dto.TotalPrice;

            await bookingRepo.UpdateAsync(booking, cancellation);

            return Ok(booking.ToResponseDto());
        }

        [HttpPatch("{id:guid}/status")]
        [Authorize(Roles = $"{RoleConstants.Driver},{RoleConstants.User}")]
        public async Task<IActionResult> UpdateStatus(Guid id, UpdateStatusDto updateDto, CancellationToken cancellation)
        {
            var existing = await bookingRepo.GetByIdAsync(id, cancellation);
            if (existing is null) return NotFound();

            existing.Status = updateDto.Status;

            await bookingRepo.UpdateAsync(existing, cancellation);

            return Ok(existing.ToResponseDto());
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = $"{RoleConstants.Driver},{RoleConstants.User}")]
        public async Task<IActionResult> DeleteAsync(Guid id, CancellationToken cancellation)
        {
            var deleted = await bookingRepo.DeleteAsync(id, cancellation);
            return deleted ? NoContent() : NotFound();
        }
    }
}
