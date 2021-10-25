import { TestBed } from '@angular/core/testing';

import { SettingsResolver } from './settings.resolver';

describe('SettingsResolver', () => {
  let resolver: SettingsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(SettingsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
