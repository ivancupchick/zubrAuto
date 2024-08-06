import { TestBed } from '@angular/core/testing';

import { CallRequestsDataService } from './call-requests-data.service';

describe('CallRequestsDataService', () => {
  let service: CallRequestsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CallRequestsDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
