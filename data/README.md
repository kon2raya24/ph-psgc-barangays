# ph-psgc-barangays data

## `barangays-2024.json`

The complete Philippine Standard Geographic Code (PSGC) barangay list, **42,046 entries**, from the **PSA Q4 2024 PSGC release**, mirrored via [`psgc.gitlab.io/api`](https://psgc.gitlab.io/api/) (the same source used for `@ph-dev-utils/core`'s cities/municipalities dataset).

- Source of truth: [PSA PSGC](https://psa.gov.ph/classification/psgc)
- Verified: 2026-05-25

### Schema

```jsonc
{
  "code": "012801001",   // PSGC 9-digit (region + province + city/mun + barangay ordinal)
  "name": "Adams (Pob.)", // as published by PSA; may include a "(Pob.)" poblacion marker
  "cityMunCode": "012801",// 6-digit parent — joins @ph-dev-utils/core CityMunicipality.code
  "province": "0128",     // 4-digit province code, or null for HUC/NCR
  "region": "01"          // 2-digit region code
}
```

### Notes & gotchas

- **Names are not unique.** "Poblacion" appears 605×, "San Isidro" 296×, "San Jose" 222×. Use `findBarangay(code)` for a single exact match; `findBarangaysByName(name)` returns all matches.
- **Referential integrity verified.** Every `cityMunCode` joins a real entry in the `@ph-dev-utils/core` cities/municipalities dataset (0 orphans).
- **Manila quirk.** Manila's 897 barangays carry sub-municipality codes (`1339xx…`) but map to the single Manila city entry `133900`. Their `code` therefore does *not* prefix-match their `cityMunCode`. The PSA sub-municipality layer (Tondo, Sampaloc, etc.) is not represented.
- **Null province.** 1,792 barangays under Highly Urbanized Cities / NCR have `province: null`. Filter by `region` instead.
- The parent code is taken from the API's explicit `municipalityCode` / `cityCode` reference, **not** by string-slicing the barangay code.
