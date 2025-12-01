import { TestBed } from '@angular/core/testing';

import { XrayTracingService } from './xray-tracing.service';

describe('XrayTracingService', () => {
  let service: XrayTracingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XrayTracingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
