import { TestBed } from '@angular/core/testing';

import { ClientNextActionDataService } from './client-next-action-data.service';

describe('ClientNextActionDataService', () => {
  let service: ClientNextActionDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientNextActionDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
