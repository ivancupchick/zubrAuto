import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZASettingsComponent } from './za-settings.component';

describe('ZASettingsComponent', () => {
  let component: ZASettingsComponent;
  let fixture: ComponentFixture<ZASettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ZASettingsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZASettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
