import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTripsComponent } from './user-trips-component';

describe('UserTripsComponent', () => {
  let component: UserTripsComponent;
  let fixture: ComponentFixture<UserTripsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTripsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserTripsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
