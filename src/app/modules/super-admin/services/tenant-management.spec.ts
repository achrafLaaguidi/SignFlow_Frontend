import { TestBed } from '@angular/core/testing';

import { TenantManagement } from './tenant-management';

describe('TenantManagement', () => {
  let service: TenantManagement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenantManagement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
