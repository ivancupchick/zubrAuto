import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeCarStatusComponent } from './change-car-status.component';

describe('ChangeCarStatusComponent', () => {
  let component: ChangeCarStatusComponent;
  let fixture: ComponentFixture<ChangeCarStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeCarStatusComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeCarStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
