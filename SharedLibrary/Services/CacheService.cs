using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace SharedLibrary.Services
{
    public interface ICacheService 
    {
        Task<T?> GetAsync<T>(string key, CancellationToken cancellation = default);
        Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellation = default);
        Task RemoveAsync(string key, CancellationToken cancellation = default);
        Task RemoveByPrefixAsync(string prefix, CancellationToken cancellation = default);
        Task TrackKeyAsync(string prefix, string key, CancellationToken cancellation = default);
    }

    public class CacheService(IDistributedCache cache) : ICacheService
    {
        private static readonly TimeSpan DefaultExpiry = TimeSpan.FromSeconds(30);

        public async Task<T?> GetAsync<T>(string key, CancellationToken cancellation = default)
        {
            var json = await cache.GetStringAsync(key, cancellation);
            return json is null ? default : JsonSerializer.Deserialize<T>(json);
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellation = default)
        {
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiry ?? DefaultExpiry
            };

            await cache.SetStringAsync(key, JsonSerializer.Serialize(value), options, cancellation);
        }

        public async Task RemoveAsync(string key, CancellationToken cancellation = default)
        {
            await cache.RemoveAsync(key, cancellation);
        }

        public async Task RemoveByPrefixAsync(string prefix, CancellationToken cancellation = default)
        {
            var indexKey = $"_index:{prefix}";
            var indexJson = await cache.GetStringAsync(indexKey, cancellation);
            if (indexJson is null) return;

            var keys = JsonSerializer.Deserialize<List<string>>(indexJson) ?? [];

            foreach (var key in keys)
                await cache.RemoveAsync(key, cancellation);

            await cache.RemoveAsync(indexKey, cancellation);
        }

        public async Task TrackKeyAsync(string prefix, string key, CancellationToken cancellation = default)
        {
            var indexKey = $"_index:{prefix}";
            var indexJson = await cache.GetStringAsync(indexKey, cancellation);
            var keys = indexJson is null
                ? []
                : JsonSerializer.Deserialize<List<string>>(indexJson) ?? [];

            if (!keys.Contains(key))
            {
                keys.Add(key);
                await cache.SetStringAsync(indexKey, JsonSerializer.Serialize(keys), cancellation);
            }
        }
    }
}
