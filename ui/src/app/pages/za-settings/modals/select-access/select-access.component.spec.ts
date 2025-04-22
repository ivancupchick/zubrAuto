import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectAccessComponent } from './select-access.component';

describe('SelectAccessComponent', () => {
  let component: SelectAccessComponent;
  let fixture: ComponentFixture<SelectAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectAccessComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
