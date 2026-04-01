using Microsoft.EntityFrameworkCore;
using SharedLibrary.Models.Pagination;

namespace SharedLibrary.Extensions
{
    public static class QueryableExtensions
    {
        public static async Task<PagedResponse<T>> ToPagedResponseAsync<T>(
            this IQueryable<T> query,
            PagedRequest request,
            CancellationToken cancellation = default) 
        {
            var totalCount = await query.CountAsync(cancellation);
            var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

            var items = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellation);

            return new PagedResponse<T>(
                Items: items,
                Page: request.Page,
                PageSize: request.PageSize,
                TotalCount: totalCount,
                TotalPages: totalPages);
        }
    }
}
