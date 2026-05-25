/**
 * Cross-package integration test: verifies that every barangay's cityMunCode
 * joins a real cities/municipalities entry in @ph-dev-utils/core. This is the
 * load-bearing contract between the two packages — if it ever breaks (e.g.
 * core ships a new PSGC release without psgc-barangays being updated), every
 * `region → province → city → barangay` walk in user code silently breaks.
 */
import { describe, it, expect } from 'vitest';
import { listCitiesMunicipalities, findCityMunicipality } from '@ph-dev-utils/core';
import { listBarangays, countBarangays } from '../src/barangays';

describe('cross-package join with @ph-dev-utils/core', () => {
  it('every barangay cityMunCode joins a real city/municipality (0 orphans)', () => {
    const cityCodes = new Set(listCitiesMunicipalities().map(c => c.code));
    const orphans = listBarangays().filter(b => !cityCodes.has(b.cityMunCode));
    expect(orphans).toEqual([]);
  });

  it('every cityMunCode appears in core (set-based, fast)', () => {
    const cityCodes = new Set(listCitiesMunicipalities().map(c => c.code));
    const usedParents = new Set(listBarangays().map(b => b.cityMunCode));
    for (const code of usedParents) {
      expect(cityCodes.has(code)).toBe(true);
    }
  });

  it('Cebu City: walk barangays via core lookup', () => {
    const cebuCity = findCityMunicipality('Cebu City');
    expect(cebuCity).not.toBeNull();
    const cebuBarangays = listBarangays({ cityMunCode: cebuCity!.code });
    expect(cebuBarangays.length).toBeGreaterThan(50); // Cebu City has 80 barangays
    expect(cebuBarangays.every(b => b.cityMunCode === cebuCity!.code)).toBe(true);
  });

  it('Manila: 897 barangays all map to single Manila entry', () => {
    const manila = findCityMunicipality('Manila');
    expect(manila?.code).toBe('133900');
    expect(countBarangays({ cityMunCode: '133900' })).toBe(897);
  });

  it('Quezon City: every barangay shares region 13 + null province with parent', () => {
    // Look up by code, not by name — "Quezon" alone is ambiguous (there's a Quezon
    // municipality in Cagayan Valley + others), so findCityMunicipality('Quezon City')
    // can match the wrong entry depending on iteration order.
    const qc = findCityMunicipality('137404');
    expect(qc?.name).toBe('Quezon City');
    expect(qc!.region).toBe('13');
    expect(qc!.province).toBeNull();
    const qcBarangays = listBarangays({ cityMunCode: qc!.code });
    expect(qcBarangays.length).toBeGreaterThan(100); // QC has 142 barangays
    expect(qcBarangays.every(b => b.region === '13' && b.province === null)).toBe(true);
  });

  it('barangay province matches parent city/municipality province (excluding Manila quirk)', () => {
    const cities = new Map(listCitiesMunicipalities().map(c => [c.code, c]));
    const mismatches = listBarangays()
      .filter(b => b.cityMunCode !== '133900') // Manila barangays have own province=null even when grouped
      .filter(b => cities.get(b.cityMunCode)!.province !== b.province);
    expect(mismatches).toEqual([]);
  });
});
