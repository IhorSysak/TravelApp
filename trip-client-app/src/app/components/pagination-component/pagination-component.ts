import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination-component',
  imports: [],
  templateUrl: './pagination-component.html',
  styleUrl: './pagination-component.scss',
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly hasPreviousPage = input.required<boolean>();
  readonly hasNextPage = input.required<boolean>();

  readonly previousPageClick = output<void>();
  readonly nextPageClick = output<void>();
}
