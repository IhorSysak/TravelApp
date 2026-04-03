export interface PagedResponse<T> {
    items: T[];
    totalCount: number;
    totalPages: number;
    page: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}