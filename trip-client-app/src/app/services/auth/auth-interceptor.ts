import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject} from '@angular/core';
import { AuthService } from './auth-service';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req);
}
