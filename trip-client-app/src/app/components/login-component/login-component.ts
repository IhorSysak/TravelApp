import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service';
import { LoginRequest } from '../../models/auth.model';
import { ToastService } from '../../services/toast/toast-service';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly isLoading = this.authService.isLoading;
  readonly error = this.authService.error;
  readonly showPassword = signal(false);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  
  onSubmit() {
    if(this.loginForm.invalid || this.isLoading()) {
      return;
    }

    const request: LoginRequest = this.loginForm.getRawValue();
    this.authService.login(request).subscribe({
      next: () => this.authService.redirectBasedOnRole(),
      error: () => console.error('Login failed')
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  getControl(controlName: string) {
    return this.loginForm.get(controlName);
  }
}
