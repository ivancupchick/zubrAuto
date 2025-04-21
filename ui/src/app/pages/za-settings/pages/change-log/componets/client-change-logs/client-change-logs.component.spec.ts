import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientChangeLogsComponent } from './client-change-logs.component';

describe('ClientChangeLogsComponent', () => {
  let component: ClientChangeLogsComponent;
  let fixture: ComponentFixture<ClientChangeLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientChangeLogsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientChangeLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
