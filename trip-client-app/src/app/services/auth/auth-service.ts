import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthError, AuthResponse, LoginRequest, RegisterRequest, User, UserRole } from '../../models/auth.model';
import { environment } from '../../environments/environment.development';
import { ToastService } from '../toast/toast-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  private readonly currentUserSignal = signal<User | null>(null);
  private readonly isLoadingSignal = signal(false);
  private readonly errorSignal = signal<AuthError | null>(null);

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  private readonly authTokenKey = 'auth_token';
  private readonly authUserKey = 'auth_user';

  constructor() {
    this.restoreSession();
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<AuthResponse>(environment.authApiUrl + 'login', request).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error)),
      finalize(() => this.isLoadingSignal.set(false))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<AuthResponse>(environment.authApiUrl + 'register', request).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error)),
      finalize(() => this.isLoadingSignal.set(false))
    );
  }
  
  logout(): void {
    localStorage.removeItem(this.authTokenKey);
    localStorage.removeItem(this.authUserKey);

    this.currentUserSignal.set(null);
    this.errorSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
  }

  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  redirectBasedOnRole(): void {
    const user = this.getCurrentUser();
    const role = user?.role;

    if (role === UserRole.DRIVER) {
      this.router.navigate(['/driver/trips']);
    } else {
      this.router.navigate(['/user/trips']);
    }
  }

  private restoreSession(): void {
    const token = this.getToken();
    const userJson = localStorage.getItem(this.authUserKey);

    if (!token || !userJson) return;

    if (this.isTokenExpired(token)) {
      this.logout();
      return;
    }

    try {
      const user: User = JSON.parse(userJson);
      this.currentUserSignal.set(user);
    } catch {
      this.logout();
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp < now;
    }
    catch {
      return true;
    }
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.authTokenKey, response.token);
    localStorage.setItem(this.authUserKey, JSON.stringify(response.user));
    this.currentUserSignal.set(response.user);
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    const authError = this.mapError(error);
    this.errorSignal.set(authError);
    this.toastService.error(authError.message);
    return throwError(() => authError);
  }

  private mapError(error: HttpErrorResponse): AuthError {
    switch (error.status) {
      case 400: return {
        message: error.error?.message || 'Invalid request.',
        code: 'VALIDATION_ERROR',
        details: error.error?.details
      };
      case 401: return {
        message: 'Invalid email or password.',
        code: 'INVALID_CREDENTIALS'
      };
      case 409: return {
        message: 'Email is already registered.',
        code: 'EMAIL_EXISTS'
      };
      case 500: return {
        message: 'Server error. Please try again later.',
        code: 'SERVER_ERROR'
      };
      default: return {
        message: 'An unknown error occurred.',
        code: 'UNKNOWN_ERROR'
      };
    }
  }
}
