import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserBookingsComponent } from './user-bookings-component';

describe('UserBookingsComponent', () => {
  let component: UserBookingsComponent;
  let fixture: ComponentFixture<UserBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserBookingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserBookingsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
