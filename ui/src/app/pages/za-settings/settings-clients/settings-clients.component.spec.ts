import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsClientsComponent } from './settings-clients.component';

describe('SettingsClientsComponent', () => {
  let component: SettingsClientsComponent;
  let fixture: ComponentFixture<SettingsClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsClientsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
