<?php

declare(strict_types=1);

namespace PhDevUtils\PsgcBarangays\Tests;

use PhDevUtils\Address;
use PhDevUtils\PsgcBarangays\Barangays;
use PHPUnit\Framework\TestCase;

/**
 * Cross-package integration test: every barangay's cityMunCode must join a real
 * city/municipality entry in phdevutils/core. This contract is load-bearing for
 * any `region → province → city → barangay` walk; a future PSGC update on either
 * side must keep them in sync.
 */
final class CrossPackageTest extends TestCase
{
    public function testEveryBarangayCityMunCodeJoinsRealCity(): void
    {
        $cityCodes = array_flip(array_column(Address::listCitiesMunicipalities(), 'code'));
        $orphans = [];
        foreach (Barangays::list() as $b) {
            if (!isset($cityCodes[$b['cityMunCode']])) {
                $orphans[] = $b['code'];
            }
        }
        $this->assertSame([], $orphans);
    }

    public function testCebuCityBarangayWalk(): void
    {
        $cebu = Address::findCityMunicipality('Cebu City');
        $this->assertNotNull($cebu);
        $barangays = Barangays::list(['cityMunCode' => $cebu['code']]);
        $this->assertGreaterThan(50, count($barangays));
        foreach ($barangays as $b) {
            $this->assertSame($cebu['code'], $b['cityMunCode']);
        }
    }

    public function testManila897BarangaysMapToManilaEntry(): void
    {
        $manila = Address::findCityMunicipality('Manila');
        $this->assertSame('133900', $manila['code']);
        $this->assertSame(897, Barangays::count(['cityMunCode' => '133900']));
    }

    public function testQuezonCityBarangayWalk(): void
    {
        // Look up by code to avoid the "Quezon" name ambiguity.
        $qc = Address::findCityMunicipality('137404');
        $this->assertSame('Quezon City', $qc['name']);
        $this->assertSame('13', $qc['region']);
        $this->assertNull($qc['province']);
        $barangays = Barangays::list(['cityMunCode' => $qc['code']]);
        $this->assertGreaterThan(100, count($barangays));
        foreach ($barangays as $b) {
            $this->assertSame('13', $b['region']);
            $this->assertNull($b['province']);
        }
    }

    public function testBarangayProvinceMatchesParentProvince(): void
    {
        $cityByCode = [];
        foreach (Address::listCitiesMunicipalities() as $c) {
            $cityByCode[$c['code']] = $c;
        }
        $mismatches = [];
        foreach (Barangays::list() as $b) {
            if ($b['cityMunCode'] === '133900') {
                // Manila quirk — sub-municipality barangays roll up to Manila city; skip.
                continue;
            }
            $parent = $cityByCode[$b['cityMunCode']];
            if ($parent['province'] !== $b['province']) {
                $mismatches[] = $b['code'];
            }
        }
        $this->assertSame([], $mismatches);
    }
}
