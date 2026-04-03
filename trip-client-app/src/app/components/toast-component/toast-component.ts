import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast/toast-service';

@Component({
  selector: 'app-toast-component',
  standalone: true,
  imports: [],
  templateUrl: './toast-component.html',
  styleUrl: './toast-component.scss',
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
