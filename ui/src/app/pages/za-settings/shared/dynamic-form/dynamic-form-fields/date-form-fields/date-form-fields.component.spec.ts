import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateFormFieldsComponent } from './date-form-fields.component';

describe('DateFormFieldsComponent', () => {
  let component: DateFormFieldsComponent;
  let fixture: ComponentFixture<DateFormFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateFormFieldsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DateFormFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
