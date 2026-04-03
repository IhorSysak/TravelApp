import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../../models/toast.model';

@Injectable({
  providedIn: 'root',
})

export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  showToast(message: string, type: ToastType, duration = 3000) : void{
    const toast: Toast = {
      id: crypto.randomUUID(),
      message,
      type,
      duration
    };

    this.toasts.update(t => [...t, toast]);

    setTimeout(() => { this.remove(toast.id); }, duration);
  }

  remove(id: string) {
    this.toasts.update((t) => t.filter((t) => t.id !== id));
  }

  success(message: string): void { this.showToast(message, 'success'); }
  error(message: string): void { this.showToast(message, 'error', 5000); }
  info(message: string): void { this.showToast(message, 'info'); }
  warning(message: string): void { this.showToast(message, 'warning'); }
}
