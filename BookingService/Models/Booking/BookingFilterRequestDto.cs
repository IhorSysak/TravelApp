using SharedLibrary.Models.Pagination;

namespace BookingService.Models.Booking
{
    public class BookingFilterRequestDto
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public string? SortBy { get; init; }
        public bool SortDescending { get; init; } = false;
        public string? From { get; init; }
        public string? To { get; init; }
        public DateOnly? Date { get; init; }
        public TimeOnly? Time { get; init; }
        public PagedRequest ToPagedRequest() => new()
        {
            Page = Page,
            PageSize = PageSize,
            SortBy = SortBy,
            SortDescending = SortDescending
        };
    }
}
