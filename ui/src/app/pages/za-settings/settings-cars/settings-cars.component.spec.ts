import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsCarsComponent } from './settings-cars.component';

describe('SettingsCarsComponent', () => {
  let component: SettingsCarsComponent;
  let fixture: ComponentFixture<SettingsCarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsCarsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsCarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
