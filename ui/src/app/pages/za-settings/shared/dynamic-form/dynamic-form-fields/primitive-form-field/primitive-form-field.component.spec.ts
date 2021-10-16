import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimitiveFormFieldComponent } from './primitive-form-field.component';

describe('PrimitiveFormFieldComponent', () => {
  let component: PrimitiveFormFieldComponent;
  let fixture: ComponentFixture<PrimitiveFormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrimitiveFormFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrimitiveFormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
