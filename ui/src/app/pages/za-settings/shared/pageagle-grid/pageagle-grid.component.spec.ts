import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageagleGridComponent } from './pageagle-grid.component';

describe('PageagleGridComponent', () => {
  let component: PageagleGridComponent<any>;
  let fixture: ComponentFixture<PageagleGridComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageagleGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageagleGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
