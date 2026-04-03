import { computed, Injectable, signal } from '@angular/core';

export class PaginationService {
  readonly currentPage = signal(1);
  readonly totalCount = signal(0);
  readonly hasNextPage = signal(false);
  readonly hasPreviousPage = signal(false);

  constructor(readonly pageSize: number = 10) {}

  readonly totalPages = computed(() =>
    Math.ceil(this.totalCount() / this.pageSize)
  );

  update(totalCount: number, hasNextPage: boolean, hasPreviousPage: boolean): void {
    this.totalCount.set(totalCount);
    this.hasNextPage.set(hasNextPage);
    this.hasPreviousPage.set(hasPreviousPage);
  }

  nextPage(onPageChange: () => void): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      onPageChange();
    }
  }

  previousPage(onPageChange: () => void): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      onPageChange();
    }
  }
}
