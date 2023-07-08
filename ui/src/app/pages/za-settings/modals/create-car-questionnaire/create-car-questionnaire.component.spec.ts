import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatecarQuestionnaireComponent } from './create-car-questionnaire.component';

describe('CreatecarQuestionnaireComponent', () => {
  let component: CreatecarQuestionnaireComponent;
  let fixture: ComponentFixture<CreatecarQuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatecarQuestionnaireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatecarQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
