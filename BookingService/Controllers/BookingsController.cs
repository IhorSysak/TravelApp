using BookingService.Entities;
using BookingService.Mapper;
using BookingService.Messaging;
using BookingService.Models.Booking;
using BookingService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Models.Pagination;
using SharedLibrary.Repositories;
using SharedLibrary.Utility;

namespace BookingService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookingsController(
        ILogger<BookingsController> logger,
        IMessageProducer messageProducer,
        IGenericRepository<Booking> bookingRepo,
        ITripServiceClient tripServiceClient) : ControllerBase
    {
        [HttpGet]
        [Authorize(Roles = $"{RoleConstants.Driver},{RoleConstants.User}")]
        public async Task<IActionResult> GetAllAsync([FromQuery] BookingFilterRequestDto requestDto, CancellationToken cancellation)
        {
            var pagedRequest = requestDto.ToPagedRequest();

            var query = bookingRepo.GetQueryable();
            if (requestDto.DriverId.HasValue)
                query = query.Where(t => t.DriverId == requestDto.DriverId.Value);

            if (requestDto.PassengerId.HasValue)
                query = query.Where(t => t.PassengerId == requestDto.PassengerId.Value);

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

            var trip = await tripServiceClient.GetTripAsync(request.TripId, cancellation); // need it?
            if (trip is null)
                return NotFound("Trip not found");

            var booking = request.ToEntity();
            await bookingRepo.CreateAsync(booking, cancellation);

            await messageProducer.SendingMessageAsync(request);

            logger.LogInformation("Booking sent for trip {TripId} by {Passenger}", request.TripId, request.PassengerName);

            return Ok(new { Message = "Booking request sent successfully." });
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
