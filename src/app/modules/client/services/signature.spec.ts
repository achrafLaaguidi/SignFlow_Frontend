import { TestBed } from '@angular/core/testing';

import { Signature } from './signature';

describe('Signature', () => {
  let service: Signature;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Signature);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
