import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResponse } from '../../models/pagging.model';

@Injectable({
  providedIn: 'root',
})
export abstract class GenericService<T, TCreate, TUpdate = TCreate> {
  protected readonly http = inject(HttpClient);

  constructor(protected readonly baseUrl: string) {}

  getAll(params: any): Observable<PagedResponse<T>> {
    return this.http.get<PagedResponse<T>>(this.baseUrl, { params: params });
  }

  getById(id: string): Observable<T> {
    return this.http.get<T>(this.baseUrl + id);
  }

  create(request: TCreate): Observable<T> {
    return this.http.post<T>(this.baseUrl, request);
  }

  update(id: string, request: TUpdate): Observable<T> {
    return this.http.put<T>(this.baseUrl + id, request);
  }

  patch(id: string, request: Partial<TUpdate>): Observable<T> {
    return this.http.patch<T>(this.baseUrl + id, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.baseUrl + id);
  }
}
