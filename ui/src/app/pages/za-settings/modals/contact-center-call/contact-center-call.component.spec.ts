import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactCenterCallComponent } from './contact-center-call.component';

describe('ContactCenterCallComponent', () => {
  let component: ContactCenterCallComponent;
  let fixture: ComponentFixture<ContactCenterCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactCenterCallComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactCenterCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
