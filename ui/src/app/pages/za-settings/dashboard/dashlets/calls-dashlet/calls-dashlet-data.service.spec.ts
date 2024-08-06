import { TestBed } from '@angular/core/testing';

import { CallsDashletDataService } from './calls-dashlet-data.service';

describe('CallsDashletDataService', () => {
  let service: CallsDashletDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CallsDashletDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
