import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export interface Barangay {
  /** PSGC 9-digit code (region + province + city/mun + barangay ordinal). */
  code: string;
  /** Barangay name as published by PSA (may include a "(Pob.)" poblacion marker). */
  name: string;
  /** 6-digit parent city/municipality code — joins `@ph-dev-utils/core`'s `CityMunicipality.code`. */
  cityMunCode: string;
  /** 4-digit province code, or `null` for HUC/NCR barangays not under any province. */
  province: string | null;
  /** 2-digit region code. */
  region: string;
}

// Loaded at runtime (not a compile-time JSON import): the dataset is ~4 MB / 42k entries,
// and `resolveJsonModule` would force tsc to infer a literal type for every record — which
// is pathologically slow. Runtime fs.readFileSync keeps the build fast and the types simple.
const dataPath = join(dirname(fileURLToPath(import.meta.url)), '../data/barangays-2024.json');
const barangays: Barangay[] = (
  JSON.parse(readFileSync(dataPath, 'utf-8')) as { barangays: Barangay[] }
).barangays;

export interface BarangayFilter {
  /** 6-digit parent city/municipality code. */
  cityMunCode?: string;
  /** 4-digit province code (`null` matches HUC/NCR barangays). */
  province?: string | null;
  /** 2-digit region code. */
  region?: string;
}

/**
 * List barangays, optionally filtered. Source: PSA Q4 2024 PSGC release (42,046 entries).
 *
 * @example
 *   listBarangays({ cityMunCode: '012801' }); // all barangays of one municipality
 *   listBarangays({ region: '13' });          // all NCR barangays
 *   listBarangays({ province: '0722' });       // all barangays in Cebu province
 */
export function listBarangays(filter: BarangayFilter = {}): Barangay[] {
  let out = barangays;
  if (filter.cityMunCode !== undefined) out = out.filter(b => b.cityMunCode === filter.cityMunCode);
  if (filter.province !== undefined) out = out.filter(b => b.province === filter.province);
  if (filter.region !== undefined) out = out.filter(b => b.region === filter.region);
  return out.slice();
}

/**
 * Look up a single barangay by its 9-digit PSGC code. Returns `null` if not found.
 *
 * Note: barangay *names* are not unique nationwide, so this only matches by code.
 * To search by name, use {@link findBarangaysByName}.
 */
export function findBarangay(code: string): Barangay | null {
  if (typeof code !== 'string') return null;
  const q = code.trim();
  return barangays.find(b => b.code === q) ?? null;
}

/**
 * Find all barangays matching a name (case-insensitive), optionally scoped by filter.
 *
 * Barangay names repeat heavily across the country — "San Isidro", "Poblacion", and
 * "San Roque" each occur hundreds of times — so this always returns an array. Scope it
 * with a filter (e.g. `{ region }` or `{ cityMunCode }`) to narrow results.
 *
 * @example
 *   findBarangaysByName('San Isidro');                  // hundreds of matches
 *   findBarangaysByName('San Isidro', { region: '13' }); // only NCR matches
 */
export function findBarangaysByName(name: string, filter: BarangayFilter = {}): Barangay[] {
  if (typeof name !== 'string' || !name.trim()) return [];
  const q = name.trim().toLowerCase();
  return listBarangays(filter).filter(b => b.name.toLowerCase() === q);
}

/** Count barangays matching a filter (or all of them). Cheaper than `listBarangays(...).length`. */
export function countBarangays(filter: BarangayFilter = {}): number {
  if (filter.cityMunCode === undefined && filter.province === undefined && filter.region === undefined) {
    return barangays.length;
  }
  let n = 0;
  for (const b of barangays) {
    if (filter.cityMunCode !== undefined && b.cityMunCode !== filter.cityMunCode) continue;
    if (filter.province !== undefined && b.province !== filter.province) continue;
    if (filter.region !== undefined && b.region !== filter.region) continue;
    n++;
  }
  return n;
}
