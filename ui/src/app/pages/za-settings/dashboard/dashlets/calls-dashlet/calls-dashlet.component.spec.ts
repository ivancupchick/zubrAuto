import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallsDashletComponent } from './calls-dashlet.component';

describe('CallsDashletComponent', () => {
  let component: CallsDashletComponent;
  let fixture: ComponentFixture<CallsDashletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallsDashletComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CallsDashletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
