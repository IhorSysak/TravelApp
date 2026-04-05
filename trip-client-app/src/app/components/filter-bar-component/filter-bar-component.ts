import { Component, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-bar-component',
  imports: [FormsModule],
  templateUrl: './filter-bar-component.html',
  styleUrl: './filter-bar-component.scss',
})
export class FilterBarComponent implements OnInit {
  readonly initialFrom = input<string>('');
  readonly initialTo = input<string>('');
  readonly initialDate = input<string>('');
  readonly initialTime = input<string>('');

  readonly fromValue = signal('');
  readonly toValue = signal('');
  readonly dateValue = signal('');
  readonly timeValue = signal('');

  readonly filterChanged = output<{from?: string, to?: string, date?: string, time?: string}>();

  ngOnInit(): void {
    this.fromValue.set(this.initialFrom());
    this.toValue.set(this.initialTo());
    this.dateValue.set(this.initialDate());
    this.timeValue.set(this.initialTime());
  }

  apply(): void {
    this.filterChanged.emit({
      from: this.fromValue() || undefined,
      to: this.toValue() || undefined,
      date: this.dateValue() || undefined,
      time: this.timeValue() || undefined
    });
  }

  clear(): void {
    this.fromValue.set('');
    this.toValue.set('');
    this.dateValue.set('');
    this.timeValue.set('');
    this.apply();
  }
}
