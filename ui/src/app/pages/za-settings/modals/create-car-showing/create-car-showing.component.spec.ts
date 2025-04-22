import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCarShowingComponent } from './create-car-showing.component';

describe('CreateCarShowingComponent', () => {
  let component: CreateCarShowingComponent;
  let fixture: ComponentFixture<CreateCarShowingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCarShowingComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCarShowingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
