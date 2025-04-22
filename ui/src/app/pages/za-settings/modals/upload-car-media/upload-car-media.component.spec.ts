import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadCarMediaComponent } from './upload-car-media.component';

describe('UploadCarMediaComponent', () => {
  let component: UploadCarMediaComponent;
  let fixture: ComponentFixture<UploadCarMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadCarMediaComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadCarMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
