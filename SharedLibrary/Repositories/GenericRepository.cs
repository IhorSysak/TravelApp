using Microsoft.EntityFrameworkCore;
using SharedLibrary.Extensions;
using SharedLibrary.Models.Pagination;

namespace SharedLibrary.Repositories
{
    public interface IGenericRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellation = default);
        Task<PagedResponse<T>> GetPagedAsync(PagedRequest request, IQueryable<T> query, CancellationToken cancellation = default);
        Task<T?> GetByIdAsync(Guid id, CancellationToken cancellation = default);
        Task<T> CreateAsync(T entity, CancellationToken cancellation = default);
        Task<T?> UpdateAsync(T entity, CancellationToken cancellation = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellation = default);
        IQueryable<T> GetQueryable();
    }

    public class GenericRepository<T>(DbContext context) : IGenericRepository<T> where T : class
    {
        protected readonly DbSet<T> _dbSet = context.Set<T>();

        public async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellation = default) => await _dbSet.ToListAsync(cancellation);

        public async Task<PagedResponse<T>> GetPagedAsync(PagedRequest request, IQueryable<T> query, CancellationToken cancellation = default) 
        {
            var queryToExecute = query ?? _dbSet.AsNoTracking().AsQueryable();

            if (!string.IsNullOrEmpty(request.SortBy))
            {
                queryToExecute = request.SortDescending
                    ? queryToExecute.OrderByDescending(e => EF.Property<object>(e, request.SortBy))
                    : queryToExecute.OrderBy(e => EF.Property<object>(e, request.SortBy));
            }
            else 
            {
                queryToExecute = queryToExecute.OrderBy(e => EF.Property<object>(e!, "Id"));
            }

            return await queryToExecute.ToPagedResponseAsync(request, cancellation);
        }

        public async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellation = default) => await _dbSet.FindAsync([id, cancellation], cancellation);

        public async Task<T> CreateAsync(T entity, CancellationToken cancellation = default)
        {
            await _dbSet.AddAsync(entity, cancellation);
            await context.SaveChangesAsync(cancellation);
            return entity;
        }

        public async Task<T?> UpdateAsync(T updated, CancellationToken cancellation = default)
        {
            await context.SaveChangesAsync(cancellation);
            return updated;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellation = default)
        {
            var entity = await _dbSet.FindAsync(id, cancellation);
            if (entity is null) return false;

            _dbSet.Remove(entity);
            await context.SaveChangesAsync(cancellation);
            return true;
        }

        public IQueryable<T> GetQueryable() 
        {
            return _dbSet.AsNoTracking().AsQueryable();
        }
    }
}

/*public interface IBookingRepository : IGenericRepository<Booking>
{
    Task<IEnumerable<Booking>> GetByTripIdAsync(Guid tripId);
}

public class BookingRepository(TripContext context)
    : GenericRepository<Booking>(context), IBookingRepository
{
    public async Task<IEnumerable<Booking>> GetByTripIdAsync(Guid tripId) =>
        await _dbSet
            .Include(b => b.Trip)
            .Where(b => b.TripId == tripId)
            .ToListAsync();
}
*/