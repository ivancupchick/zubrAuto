import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFieldComponent } from './create-field.component';

describe('CreateFieldComponent', () => {
  let component: CreateFieldComponent;
  let fixture: ComponentFixture<CreateFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateFieldComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
