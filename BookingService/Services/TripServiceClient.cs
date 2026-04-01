using BookingService.Models.Trip;
using System.Net;
using System.Net.Http.Headers;

namespace BookingService.Services
{
    public interface ITripServiceClient
    {
        Task<TripDto?> GetTripAsync(Guid tripId, CancellationToken cancellationToken = default);
    }

    public class TripServiceClient(HttpClient httpClient, IHttpContextAccessor httpContextAccessor) : ITripServiceClient
    {
        public async Task<TripDto?> GetTripAsync(Guid tripId, CancellationToken cancellationToken = default)
        {
            try
            {
                var token = httpContextAccessor.HttpContext?.Request.Headers.Authorization.FirstOrDefault();
                if (!string.IsNullOrEmpty(token))
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.Replace("Bearer ", ""));

                var response = await httpClient.GetAsync($"api/trips/{tripId}", cancellationToken);

                if (response.StatusCode == HttpStatusCode.NotFound)
                    return null;

                response.EnsureSuccessStatusCode();

                return await response.Content.ReadFromJsonAsync<TripDto>(cancellationToken);
            }
            catch (HttpRequestException ex)
            {
                throw new Exception($"TripService unreachable: {ex.Message}");
            }
        }
    }
}
