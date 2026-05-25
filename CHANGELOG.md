# Changelog

All notable changes to this project will be documented in this file. The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.1.0] - 2026-05-25

Initial release. The complete PSGC barangay dataset for the Philippines, with zero-dependency lookup helpers for JS and PHP. Companion to [ph-dev-utils](https://github.com/kon2raya24/ph-dev-utils) — barangays are shipped as a separate package because the dataset (~4 MB, 42,046 entries) is too large to bundle into `@ph-dev-utils/core`.

### Added

- **Data** — `data/barangays-2024.json`: 42,046 barangays from the PSA Q4 2024 PSGC release. Each entry: `code` (9-digit), `name`, `cityMunCode` (6-digit parent), `province` (4-digit or null), `region` (2-digit).
- **JS** (`@ph-dev-utils/psgc-barangays`) — `listBarangays(filter?)`, `findBarangay(code)`, `findBarangaysByName(name, filter?)`, `countBarangays(filter?)`. Types: `Barangay`, `BarangayFilter`.
- **PHP** (`phdevutils/psgc-barangays`) — `Barangays::list()`, `Barangays::find()`, `Barangays::findByName()`, `Barangays::count()`.

### Verified

- Referential integrity: every `cityMunCode` joins a real `@ph-dev-utils/core` cities/municipalities entry (0 orphans).
- 1,792 null-province entries (HUC/NCR), matching the cities dataset's null-province convention.
- 897 Manila sub-municipality barangays correctly map to the Manila city entry (133900).
- Tests: 17 vitest + 14 PHPUnit = 31 green.

### Notes

- Barangay names are **not unique** nationwide; `findBarangaysByName` returns an array by design.
- The dataset is loaded at runtime via `fs.readFileSync` (JS) / `DataLoader` (PHP) rather than a compile-time JSON import — a 4 MB `resolveJsonModule` import makes `tsc` pathologically slow.

[0.1.0]: https://github.com/kon2raya24/ph-psgc-barangays/releases/tag/v0.1.0
