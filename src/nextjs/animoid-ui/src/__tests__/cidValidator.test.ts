import { issValidCIDv0, isValidCIDv1 } from '../lib/ipfs/utils';
import { describe, it, expect } from 'vitest';


describe('IPFS CID Validators', () => {
  it('isValidV0CID should return true for valid v0 CID', () => {
    const cid = 'QmYwAPJzv5CZsnAzt8auVZRnXk8qcKZx2CXwHdLXY6hu9z';
    expect(issValidCIDv0(cid)).toBe(true);
  });

  it('isValidV0CID should return false for invalid v0 CID', () => {
    const cid = 'InvalidCID';
    expect(issValidCIDv0(cid)).toBe(false);
  });

  it('isValidV1CID should return true for valid v1 CID', () => {
    const cid = 'bagaaierasords4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea';
    expect(isValidCIDv1(cid)).toBe(true);
  });

  it('isValidV1CID should return false for script without v1 CID', () => {
    const cid = 'InvalidCID';
    expect(isValidCIDv1(cid)).toBe(false);
  });
});
