import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingFooterComponent } from './setting-footer.component';

describe('SettingFooterComponent', () => {
  let component: SettingFooterComponent;
  let fixture: ComponentFixture<SettingFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingFooterComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
