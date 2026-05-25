# ph-psgc-barangays

[![npm version](https://img.shields.io/npm/v/@ph-dev-utils/psgc-barangays?label=npm&color=cb3837&logo=npm)](https://www.npmjs.com/package/@ph-dev-utils/psgc-barangays)
[![Packagist version](https://img.shields.io/packagist/v/phdevutils/psgc-barangays?label=Packagist&color=f28d1a&logo=packagist&logoColor=white)](https://packagist.org/packages/phdevutils/psgc-barangays)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Made in PH](https://img.shields.io/badge/made%20in-🇵🇭%20Philippines-0038A8)](https://github.com/kon2raya24)

The complete **PSGC barangay dataset** for the Philippines — **42,046 barangays** (PSA Q4 2024) — with zero-dependency lookup helpers for JavaScript and PHP.

Companion to [ph-dev-utils](https://github.com/kon2raya24/ph-dev-utils). Barangays ship as a **separate package** because the dataset (~4 MB) is too large to bundle into `@ph-dev-utils/core`. Every barangay's `cityMunCode` joins cleanly to `@ph-dev-utils/core`'s cities/municipalities, so you can install both and walk the full PSGC tree: region → province → city/municipality → barangay.

## Packages

| Language | Package | Install |
|----------|---------|---------|
| JavaScript / TypeScript | `@ph-dev-utils/psgc-barangays` | `npm i @ph-dev-utils/psgc-barangays` |
| PHP | `phdevutils/psgc-barangays` | `composer require phdevutils/psgc-barangays` |

## JS usage

```ts
import {
  listBarangays, findBarangay, findBarangaysByName, countBarangays,
} from '@ph-dev-utils/psgc-barangays';

countBarangays();                        // 42046
countBarangays({ region: '13' });        // 1710 (NCR)

findBarangay('012801001');
// { code: '012801001', name: 'Adams (Pob.)', cityMunCode: '012801', province: '0128', region: '01' }

listBarangays({ cityMunCode: '012801' }); // all barangays of one municipality

// Names are NOT unique — these return arrays:
findBarangaysByName('San Isidro');                  // 296 matches nationwide
findBarangaysByName('San Isidro', { region: '13' }); // 3 in NCR
```

## PHP usage

```php
use PhDevUtils\PsgcBarangays\Barangays;

Barangays::count();                          // 42046
Barangays::count(['region' => '13']);        // 1710

Barangays::find('012801001');
// ['code' => '012801001', 'name' => 'Adams (Pob.)', 'cityMunCode' => '012801', 'province' => '0128', 'region' => '01']

Barangays::list(['cityMunCode' => '012801']);
Barangays::findByName('San Isidro');                    // 296 matches
Barangays::findByName('San Isidro', ['region' => '13']); // 3 in NCR
```

## Joining to cities/municipalities

```ts
import { findCityMunicipality } from '@ph-dev-utils/core';
import { listBarangays } from '@ph-dev-utils/psgc-barangays';

const cebuCity = findCityMunicipality('Cebu City');     // { code: '072217', ... }
const barangays = listBarangays({ cityMunCode: cebuCity!.code });
```

## Gotchas worth knowing

- **Barangay names are not unique.** "Poblacion" appears 605×, "San Isidro" 296×. `findBarangay` matches by 9-digit code only; `findBarangaysByName` always returns an array.
- **Manila.** Its 897 barangays carry sub-municipality codes but map to the single Manila city entry `133900`. The sub-municipality layer (Tondo, Sampaloc…) is not modeled.
- **Null province.** 1,792 barangays under HUC/NCR have `province: null` — filter by `region` instead.

## Data

See [`data/README.md`](data/README.md) for source, schema, and verification notes. Source: PSA Q4 2024 PSGC, mirrored via [psgc.gitlab.io](https://psgc.gitlab.io/api/).

## License

MIT
