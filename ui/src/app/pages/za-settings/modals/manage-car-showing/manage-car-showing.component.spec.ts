import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCarShowingComponent } from './manage-car-showing.component';

describe('ManageCarShowingComponent', () => {
  let component: ManageCarShowingComponent;
  let fixture: ComponentFixture<ManageCarShowingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageCarShowingComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCarShowingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
