import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransformToCarShooting } from './transform-to-car-shooting.component';

describe('TransformToCarShooting', () => {
  let component: TransformToCarShooting;
  let fixture: ComponentFixture<TransformToCarShooting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransformToCarShooting],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransformToCarShooting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
