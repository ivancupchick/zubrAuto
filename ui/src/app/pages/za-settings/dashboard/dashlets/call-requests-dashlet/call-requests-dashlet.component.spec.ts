import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallRequestsDashletComponent } from './call-requests-dashlet.component';

describe('CallRequestsDashletComponent', () => {
  let component: CallRequestsDashletComponent;
  let fixture: ComponentFixture<CallRequestsDashletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallRequestsDashletComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CallRequestsDashletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
