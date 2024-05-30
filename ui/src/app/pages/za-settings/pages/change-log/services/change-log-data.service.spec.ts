import { TestBed } from '@angular/core/testing';

import { ChangeLogDataService } from './change-log-data.service';

describe('ChangeLogDataService', () => {
  let service: ChangeLogDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangeLogDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
