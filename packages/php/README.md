# phdevutils/psgc-barangays

[![Packagist version](https://img.shields.io/packagist/v/phdevutils/psgc-barangays?label=Packagist&color=f28d1a&logo=packagist&logoColor=white)](https://packagist.org/packages/phdevutils/psgc-barangays)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)

The complete **PSGC barangay dataset** for the Philippines — **42,046 barangays** (PSA Q4 2024) — with zero-dependency lookup helpers. Companion to [`phdevutils/core`](https://packagist.org/packages/phdevutils/core); every barangay's `cityMunCode` joins that package's cities/municipalities.

```bash
composer require phdevutils/psgc-barangays
```

## API — `PhDevUtils\PsgcBarangays\Barangays`

Each barangay is an associative array:

```php
[
  'code' => '012801001',   // PSGC 9-digit
  'name' => 'Adams (Pob.)',
  'cityMunCode' => '012801',// 6-digit parent (joins phdevutils/core)
  'province' => '0128',     // 4-digit, or null for HUC/NCR
  'region' => '01',         // 2-digit
]
```

### `Barangays::list(array $filter = []): array`

Filter keys: `cityMunCode`, `province` (pass `null` to match HUC/NCR), `region`.

```php
Barangays::list(['cityMunCode' => '012801']);
Barangays::list(['region' => '13']);     // all NCR
Barangays::list(['province' => null]);   // HUC/NCR with no province
```

### `Barangays::find(string $code): ?array`

Exact match by 9-digit PSGC code (names are not unique).

```php
Barangays::find('012801001'); // ['code' => '012801001', 'name' => 'Adams (Pob.)', ...]
Barangays::find('999999999'); // null
```

### `Barangays::findByName(string $name, array $filter = []): array`

Case-insensitive. **Always returns a list** — names repeat heavily ("Poblacion" 605×, "San Isidro" 296×).

```php
Barangays::findByName('San Isidro');                    // 296
Barangays::findByName('San Isidro', ['region' => '13']); // 3
```

### `Barangays::count(array $filter = []): int`

```php
Barangays::count();                   // 42046
Barangays::count(['region' => '13']); // 1710
```

## License

MIT
