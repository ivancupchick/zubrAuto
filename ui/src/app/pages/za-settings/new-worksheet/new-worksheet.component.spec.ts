import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewWorksheetComponent } from './new-worksheet.component';

describe('NewWorksheetComponent', () => {
  let component: NewWorksheetComponent;
  let fixture: ComponentFixture<NewWorksheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewWorksheetComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewWorksheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
