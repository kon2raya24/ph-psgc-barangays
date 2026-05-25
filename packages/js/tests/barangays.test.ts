import { describe, it, expect } from 'vitest';
import {
  listBarangays,
  findBarangay,
  findBarangaysByName,
  countBarangays,
} from '../src/barangays';

describe('countBarangays', () => {
  it('total matches PSA Q4 2024 release', () => {
    expect(countBarangays()).toBe(42046);
  });
  it('NCR (region 13) barangay count', () => {
    expect(countBarangays({ region: '13' })).toBe(1710);
  });
  it('null-province (HUC/NCR) count', () => {
    expect(countBarangays({ province: null })).toBe(1792);
  });
  it('Cebu province (0722)', () => {
    expect(countBarangays({ province: '0722' })).toBe(1203);
  });
  it('matches listBarangays length', () => {
    expect(countBarangays({ region: '13' })).toBe(listBarangays({ region: '13' }).length);
  });
});

describe('findBarangay', () => {
  it('finds by 9-digit code', () => {
    expect(findBarangay('012801001')).toEqual({
      code: '012801001',
      name: 'Adams (Pob.)',
      cityMunCode: '012801',
      province: '0128',
      region: '01',
    });
  });
  it('trims whitespace', () => {
    expect(findBarangay('  012801001  ')?.name).toBe('Adams (Pob.)');
  });
  it('returns null for unknown code', () => {
    expect(findBarangay('999999999')).toBeNull();
  });
  it('returns null for non-string', () => {
    // @ts-expect-error testing runtime guard
    expect(findBarangay(123)).toBeNull();
  });
});

describe('findBarangaysByName', () => {
  it('returns all matches — names are not unique', () => {
    expect(findBarangaysByName('San Isidro').length).toBe(296);
    expect(findBarangaysByName('Poblacion').length).toBe(605);
  });
  it('is case-insensitive', () => {
    expect(findBarangaysByName('san isidro').length).toBe(296);
    expect(findBarangaysByName('SAN ISIDRO').length).toBe(296);
  });
  it('scopes by filter', () => {
    expect(findBarangaysByName('San Isidro', { region: '13' }).length).toBe(3);
  });
  it('returns empty array for unknown / blank', () => {
    expect(findBarangaysByName('Nonexistent Barangay XYZ')).toEqual([]);
    expect(findBarangaysByName('')).toEqual([]);
  });
});

describe('listBarangays', () => {
  it('filters by cityMunCode', () => {
    const r = listBarangays({ cityMunCode: '012801' });
    expect(r).toHaveLength(1);
    expect(r[0].name).toBe('Adams (Pob.)');
  });
  it('every barangay has a valid 9-digit code and 6-digit parent', () => {
    const all = listBarangays();
    expect(all.every(b => /^\d{9}$/.test(b.code))).toBe(true);
    expect(all.every(b => /^\d{6}$/.test(b.cityMunCode))).toBe(true);
  });
  it('parent code prefixes the barangay code, except for Manila sub-municipalities', () => {
    const all = listBarangays();
    // Manila's barangays carry sub-municipality codes (1339xx) but map to the single
    // Manila city entry (133900), so their code does NOT prefix-match the parent.
    const exceptions = all.filter(b => !b.code.startsWith(b.cityMunCode));
    expect(exceptions.every(b => b.cityMunCode === '133900')).toBe(true);
    expect(exceptions).toHaveLength(897);
  });
  it('returns a copy (mutation-safe)', () => {
    const a = listBarangays({ region: '13' });
    a.pop();
    expect(listBarangays({ region: '13' }).length).toBe(1710);
  });
});
