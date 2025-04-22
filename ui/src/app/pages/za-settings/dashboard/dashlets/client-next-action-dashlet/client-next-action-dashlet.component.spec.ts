import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientNextActionDashletComponent } from './client-next-action-dashlet.component';

describe('ClientNextActionDashletComponent', () => {
  let component: ClientNextActionDashletComponent;
  let fixture: ComponentFixture<ClientNextActionDashletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientNextActionDashletComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientNextActionDashletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
