import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerServiceCallComponent } from './customer-service-call.component';

describe('CustomerServiceCallComponent', () => {
  let component: CustomerServiceCallComponent;
  let fixture: ComponentFixture<CustomerServiceCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerServiceCallComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerServiceCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
