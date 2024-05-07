import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallRequestsDashletComponent } from './call-requests-dashlet.component';

describe('CallRequestsDashletComponent', () => {
  let component: CallRequestsDashletComponent;
  let fixture: ComponentFixture<CallRequestsDashletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallRequestsDashletComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallRequestsDashletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
