import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteClientDealComponent } from './complete-client-deal.component';

describe('CompleteClientDealComponent', () => {
  let component: CompleteClientDealComponent;
  let fixture: ComponentFixture<CompleteClientDealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompleteClientDealComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompleteClientDealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
