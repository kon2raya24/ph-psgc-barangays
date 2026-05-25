<?php

declare(strict_types=1);

namespace PhDevUtils\PsgcBarangays;

/**
 * Lookup helpers over the PSA Q4 2024 PSGC barangay dataset (42,046 entries).
 *
 * Each barangay is an associative array:
 *   [
 *     'code'        => string,  // PSGC 9-digit
 *     'name'        => string,
 *     'cityMunCode' => string,  // 6-digit parent (joins phdevutils/core cities/municipalities)
 *     'province'    => ?string, // 4-digit, or null for HUC/NCR
 *     'region'      => string,  // 2-digit
 *   ]
 */
final class Barangays
{
    /** @var list<array{code:string,name:string,cityMunCode:string,province:?string,region:string}>|null */
    private static ?array $all = null;

    /** @return list<array{code:string,name:string,cityMunCode:string,province:?string,region:string}> */
    private static function all(): array
    {
        if (self::$all === null) {
            $data = DataLoader::load('barangays-2024');
            self::$all = $data['barangays'];
        }
        return self::$all;
    }

    /**
     * List barangays, optionally filtered.
     *
     * @param array{cityMunCode?:string, province?:?string, region?:string} $filter
     * @return list<array{code:string,name:string,cityMunCode:string,province:?string,region:string}>
     */
    public static function list(array $filter = []): array
    {
        $out = self::all();
        if (array_key_exists('cityMunCode', $filter)) {
            $out = array_filter($out, static fn ($b) => $b['cityMunCode'] === $filter['cityMunCode']);
        }
        if (array_key_exists('province', $filter)) {
            $out = array_filter($out, static fn ($b) => $b['province'] === $filter['province']);
        }
        if (array_key_exists('region', $filter)) {
            $out = array_filter($out, static fn ($b) => $b['region'] === $filter['region']);
        }
        return array_values($out);
    }

    /**
     * Look up a single barangay by its 9-digit PSGC code. Returns null if not found.
     *
     * Barangay names are not unique, so this matches by code only. Use findByName() to search names.
     *
     * @return array{code:string,name:string,cityMunCode:string,province:?string,region:string}|null
     */
    public static function find(string $code): ?array
    {
        $q = trim($code);
        foreach (self::all() as $b) {
            if ($b['code'] === $q) {
                return $b;
            }
        }
        return null;
    }

    /**
     * Find all barangays matching a name (case-insensitive), optionally scoped by filter.
     *
     * Names repeat heavily nationwide ("Poblacion" 605×, "San Isidro" 296×), so this
     * always returns a list. Scope with a filter to narrow.
     *
     * @param array{cityMunCode?:string, province?:?string, region?:string} $filter
     * @return list<array{code:string,name:string,cityMunCode:string,province:?string,region:string}>
     */
    public static function findByName(string $name, array $filter = []): array
    {
        $q = trim($name);
        if ($q === '') {
            return [];
        }
        $ql = mb_strtolower($q);
        return array_values(array_filter(
            self::list($filter),
            static fn ($b) => mb_strtolower($b['name']) === $ql,
        ));
    }

    /**
     * Count barangays matching a filter (or all of them).
     *
     * @param array{cityMunCode?:string, province?:?string, region?:string} $filter
     */
    public static function count(array $filter = []): int
    {
        if ($filter === []) {
            return count(self::all());
        }
        return count(self::list($filter));
    }
}
