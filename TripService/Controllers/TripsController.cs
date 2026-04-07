using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Models.Pagination;
using SharedLibrary.Repositories;
using SharedLibrary.Services;
using SharedLibrary.Utility;
using System.Security.Claims;
using TripService.Entities;
using TripService.Mapper;
using TripService.Models;

namespace TripService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TripsController(IGenericRepository<Trip> tripRepo, ICacheService cache) : ControllerBase
    {
        [HttpGet]
        [Authorize(Roles = $"{RoleConstants.Driver},{RoleConstants.User}")]
        public async Task<IActionResult> GetAllAsync([FromQuery] TripFilterRequestDto requestDto, CancellationToken cancellation)
        {
            var cacheKey = CacheKeys.TripsPage(Request.QueryString.Value ?? string.Empty);
            var cached = await cache.GetAsync<PagedResponse<TripResponseDto>>(cacheKey, cancellation);
            if(cached is not null)
                return Ok(cached);

            var pagedRequest = requestDto.ToPagedRequest();

            var query = tripRepo.GetQueryable();
            if (User.IsInRole(RoleConstants.Driver)) 
                query = query.Where(t => t.DriverId == Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!));

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

            var trips = await tripRepo.GetPagedAsync(pagedRequest, query, cancellation: cancellation);

            var response = new PagedResponse<TripResponseDto>(
                Items: trips.Items.Select(t => t.ToResponseDto()),
                Page: trips.Page,
                PageSize: trips.PageSize,
                TotalCount: trips.TotalCount,
                TotalPages: trips.TotalPages);

            await cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(1), cancellation);
            await cache.TrackKeyAsync(CacheKeys.TripsPrefix, cacheKey, cancellation);

            return Ok(response);
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = $"{RoleConstants.Driver},{RoleConstants.User}")]
        public async Task<IActionResult> GetByIdAsync(Guid id, CancellationToken cancellation)
        {
            var cacheKey = CacheKeys.TripById(id);
            var cached = await cache.GetAsync<TripResponseDto>(cacheKey, cancellation);
            if (cached is not null)
                return Ok(cached);

            var trip = await tripRepo.GetByIdAsync(id, cancellation);
            if (trip is null) return NotFound();

            var response = trip.ToResponseDto();
            await cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(2), cancellation);

            return Ok(response);
        }

        [HttpPost]
        [Authorize(Roles = RoleConstants.Driver)]
        public async Task<IActionResult> CreateAsync(CreateTripDto dto, CancellationToken cancellation)
        {
            var trip = dto.ToEntity();
            var created = await tripRepo.CreateAsync(trip, cancellation);

            await cache.RemoveByPrefixAsync(CacheKeys.TripsPrefix, cancellation);

            return Ok(created.ToResponseDto());
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = RoleConstants.Driver)]
        public async Task<IActionResult> UpdateAsync(Guid id, UpdateTripDto dto, CancellationToken cancellation)
        {
            var existing = await tripRepo.GetByIdAsync(id, cancellation);
            if (existing is null) return NotFound();

            existing.ApplyUpdate(dto);

            var updated = await tripRepo.UpdateAsync(existing, cancellation);

            await cache.RemoveAsync(CacheKeys.TripById(id), cancellation);
            await cache.RemoveByPrefixAsync(CacheKeys.TripsPrefix, cancellation);

            return Ok(updated?.ToResponseDto());
        }

        [HttpPatch("{id:guid}/available-seats")]
        [Authorize(Roles = $"{RoleConstants.Driver},{RoleConstants.User}")]
        public async Task<IActionResult> UpdateAvailableSeatsAsync(Guid id, UpdateAvailableSeatsDto updateDto, CancellationToken cancellation)
        {
            var existing = await tripRepo.GetByIdAsync(id, cancellation);
            if (existing is null) return NotFound();

            existing.AvailableSeats = updateDto.AvailableSeats;

            var updated = await tripRepo.UpdateAsync(existing, cancellation);

            await cache.RemoveAsync(CacheKeys.TripById(id), cancellation);
            await cache.RemoveByPrefixAsync(CacheKeys.TripsPrefix, cancellation);

            return updated is null ? BadRequest("Could not update seats") : Ok(updated.ToResponseDto());
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = RoleConstants.Driver)]
        public async Task<IActionResult> DeleteAsync(Guid id, CancellationToken cancellation)
        {
            var deleted = await tripRepo.DeleteAsync(id, cancellation);
            if (!deleted) return NotFound();

            await cache.RemoveAsync(CacheKeys.TripById(id), cancellation);
            await cache.RemoveByPrefixAsync(CacheKeys.TripsPrefix, cancellation);

            return NoContent();
        }
    }
}
