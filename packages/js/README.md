# @ph-dev-utils/psgc-barangays

[![npm version](https://img.shields.io/npm/v/@ph-dev-utils/psgc-barangays?label=npm&color=cb3837&logo=npm)](https://www.npmjs.com/package/@ph-dev-utils/psgc-barangays)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)

The complete **PSGC barangay dataset** for the Philippines — **42,046 barangays** (PSA Q4 2024) — with zero-dependency lookup helpers. Companion to [`@ph-dev-utils/core`](https://www.npmjs.com/package/@ph-dev-utils/core); every barangay's `cityMunCode` joins that package's cities/municipalities.

```bash
npm install @ph-dev-utils/psgc-barangays
```

## API

```ts
import {
  listBarangays, findBarangay, findBarangaysByName, countBarangays,
} from '@ph-dev-utils/psgc-barangays';
```

### `Barangay`

```ts
interface Barangay {
  code: string;        // PSGC 9-digit
  name: string;
  cityMunCode: string; // 6-digit parent (joins @ph-dev-utils/core CityMunicipality.code)
  province: string | null; // 4-digit, or null for HUC/NCR
  region: string;      // 2-digit
}
```

### `listBarangays(filter?): Barangay[]`

Filter by `{ cityMunCode?, province?, region? }`. Returns a fresh array (mutation-safe).

```ts
listBarangays({ cityMunCode: '012801' });
listBarangays({ region: '13' });        // all NCR
listBarangays({ province: '0722' });     // Cebu province
listBarangays({ province: null });       // HUC/NCR barangays with no province
```

### `findBarangay(code: string): Barangay | null`

Exact match by 9-digit PSGC code. Names are not unique, so this matches by code only.

```ts
findBarangay('012801001'); // { code: '012801001', name: 'Adams (Pob.)', ... }
findBarangay('999999999'); // null
```

### `findBarangaysByName(name, filter?): Barangay[]`

Case-insensitive name search. **Always returns an array** — barangay names repeat heavily ("Poblacion" 605×, "San Isidro" 296×). Scope with a filter to narrow.

```ts
findBarangaysByName('San Isidro');                  // 296 nationwide
findBarangaysByName('San Isidro', { region: '13' }); // 3 in NCR
```

### `countBarangays(filter?): number`

```ts
countBarangays();                  // 42046
countBarangays({ region: '13' });  // 1710
```

## Notes

- The dataset (~4 MB) loads at runtime via `fs.readFileSync` (Node only), not a compile-time JSON import.
- Manila's 897 barangays map to the single Manila city entry `133900`.

## License

MIT
