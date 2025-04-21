import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCallBaseComponent } from './create-call-base.component';

describe('CreateCallBaseComponent', () => {
  let component: CreateCallBaseComponent;
  let fixture: ComponentFixture<CreateCallBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateCallBaseComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCallBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
