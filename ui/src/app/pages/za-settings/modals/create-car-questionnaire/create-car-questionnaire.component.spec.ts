import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCarQuestionnaireComponent } from './create-car-questionnaire.component';

describe('CreateCarQuestionnaireComponent', () => {
  let component: CreateCarQuestionnaireComponent;
  let fixture: ComponentFixture<CreateCarQuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateCarQuestionnaireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCarQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
