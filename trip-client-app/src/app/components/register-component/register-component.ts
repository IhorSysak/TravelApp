import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service';
import { RegisterRequest } from '../../models/auth.model';
import { ToastService } from '../../services/toast/toast-service';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  readonly isLoading = this.authService.isLoading;
  readonly error = this.authService.error;
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    isDriver: [false, [Validators.required]]
  },
  { validators: this.passwordMatchValidator }
);

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if(field === 'password') {
      this.showPassword.update(value => !value);
    }
    else if(field === 'confirmPassword') {
      this.showConfirmPassword.update(value => !value);
    }
  }

  onSubmit() {
    if(this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const request: RegisterRequest = this.registerForm.getRawValue();
    this.authService.register(request).subscribe({
      next: () => this.authService.redirectBasedOnRole(),
      error: () => { this.toastService.error('Registration failed. Please try again.'); }
    });
  }

  getControl(controlName: string) {
    return this.registerForm.get(controlName);
  }

  get passwordMismatch() : boolean {
    return (
      this.registerForm.hasError('passwordMismatch') && 
      (this.registerForm.get('confirmPassword')?.touched ?? false));
  }
}
