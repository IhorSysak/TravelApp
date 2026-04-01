using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Models.Pagination;
using SharedLibrary.Repositories;
using SharedLibrary.Utility;
using TripService.Entities;
using TripService.Mapper;
using TripService.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace TripService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TripsController(IGenericRepository<Trip> tripRepo) : ControllerBase
    {
        [HttpGet]
        [Authorize(Roles = $"{RoleConstants.Driver},{RoleConstants.User}")]
        public async Task<IActionResult> GetAllAsync([FromQuery] TripFilterRequestDto requestDto, CancellationToken cancellation)
        {
            var pagedRequest = requestDto.ToPagedRequest();

            var query = tripRepo.GetQueryable();
            if (requestDto.DriverId.HasValue) 
                query = query.Where(t => t.DriverId == requestDto.DriverId.Value);

            if (!string.IsNullOrEmpty(requestDto.From))
                query = query.Where(t => t.From.ToLower().Contains(requestDto.From.ToLower()));

            if (!string.IsNullOrEmpty(requestDto.To))
                query = query.Where(t => t.To.ToLower().Contains(requestDto.To.ToLower()));
            
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

            var trips = await tripRepo.GetPagedAsync(pagedRequest, query, cancellation: cancellation);

            var response = new PagedResponse<TripResponseDto>(
                Items: trips.Items.Select(t => t.ToResponseDto()),
                Page: trips.Page,
                PageSize: trips.PageSize,
                TotalCount: trips.TotalCount,
                TotalPages: trips.TotalPages);

            return Ok(response);
        }

        /*[HttpGet("driver/{driverId:guid}")]
        [Authorize(Roles = $"{RoleConstants.Driver}")]
        public async Task<IActionResult> GetDriversTrips(Guid driverId, [FromQuery] PagedRequest request, CancellationToken cancellation)
        {
            var trips = await tripRepo.GetPagedAsync(request, filter: t => t.DriverId == driverId, cancellation);

            var response = new PagedResponse<TripResponseDto>(
                Items: trips.Items.Select(t => t.ToResponseDto()),
                Page: trips.Page,
                PageSize: trips.PageSize,
                TotalCount: trips.TotalCount,
                TotalPages: trips.TotalPages);

            return Ok(response);
        }*/

        [HttpGet("{id:guid}")]
        [Authorize(Roles = $"{RoleConstants.Driver},{RoleConstants.User}")]
        public async Task<IActionResult> GetByIdAsync(Guid id, CancellationToken cancellation)
        {
            var trip = await tripRepo.GetByIdAsync(id, cancellation);
            return trip is null ? NotFound() : Ok(trip.ToResponseDto());
        }

        [HttpPost]
        [Authorize(Roles = RoleConstants.Driver)]
        public async Task<IActionResult> CreateAsync(CreateTripDto dto, CancellationToken cancellation)
        {
            var trip = dto.ToEntity();
            var created = await tripRepo.CreateAsync(trip, cancellation);
            var response = created.ToResponseDto();

            return Ok(response);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = RoleConstants.Driver)]
        public async Task<IActionResult> UpdateAsync(Guid id, UpdateTripDto dto, CancellationToken cancellation)
        {
            var existing = await tripRepo.GetByIdAsync(id, cancellation);
            if (existing is null) return NotFound();

            existing.ApplyUpdate(dto);

            var updated = await tripRepo.UpdateAsync(existing, cancellation);
            return Ok(updated?.ToResponseDto());
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = RoleConstants.Driver)]
        public async Task<IActionResult> DeleteAsync(Guid id, CancellationToken cancellation)
        {
            var deleted = await tripRepo.DeleteAsync(id, cancellation);
            return deleted ? NoContent() : NotFound();
        }
    }
}
