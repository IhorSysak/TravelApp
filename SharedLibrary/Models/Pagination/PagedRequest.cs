namespace SharedLibrary.Models.Pagination
{
    public record PagedRequest
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public string? SortBy { get; init; }
        public bool SortDescending { get; init; } = false;
    }
}
