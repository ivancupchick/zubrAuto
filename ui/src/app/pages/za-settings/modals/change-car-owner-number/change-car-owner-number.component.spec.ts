import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeCarOwnerNumberComponent } from './change-car-owner-number.component';

describe('ChangeCarOwnerNumberComponent', () => {
  let component: ChangeCarOwnerNumberComponent;
  let fixture: ComponentFixture<ChangeCarOwnerNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangeCarOwnerNumberComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeCarOwnerNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
