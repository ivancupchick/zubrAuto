import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewQuestionnaireComponent } from './new-questionnaire.component';

describe('NewQuestionnaireComponent', () => {
  let component: NewQuestionnaireComponent;
  let fixture: ComponentFixture<NewQuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewQuestionnaireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
