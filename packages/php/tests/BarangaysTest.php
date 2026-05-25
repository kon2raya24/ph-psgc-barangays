<?php

declare(strict_types=1);

namespace PhDevUtils\PsgcBarangays\Tests;

use PhDevUtils\PsgcBarangays\Barangays;
use PHPUnit\Framework\TestCase;

final class BarangaysTest extends TestCase
{
    public function testTotalCount(): void
    {
        $this->assertSame(42046, Barangays::count());
    }

    public function testCountByRegionNCR(): void
    {
        $this->assertSame(1710, Barangays::count(['region' => '13']));
    }

    public function testCountNullProvince(): void
    {
        $this->assertSame(1792, Barangays::count(['province' => null]));
    }

    public function testCountCebuProvince(): void
    {
        $this->assertSame(1203, Barangays::count(['province' => '0722']));
    }

    public function testFindByCode(): void
    {
        $this->assertSame([
            'code' => '012801001',
            'name' => 'Adams (Pob.)',
            'cityMunCode' => '012801',
            'province' => '0128',
            'region' => '01',
        ], Barangays::find('012801001'));
    }

    public function testFindTrimsWhitespace(): void
    {
        $this->assertSame('Adams (Pob.)', Barangays::find('  012801001  ')['name']);
    }

    public function testFindReturnsNullForUnknown(): void
    {
        $this->assertNull(Barangays::find('999999999'));
    }

    public function testFindByNameReturnsAllMatches(): void
    {
        $this->assertCount(296, Barangays::findByName('San Isidro'));
        $this->assertCount(605, Barangays::findByName('Poblacion'));
    }

    public function testFindByNameCaseInsensitive(): void
    {
        $this->assertCount(296, Barangays::findByName('san isidro'));
        $this->assertCount(296, Barangays::findByName('SAN ISIDRO'));
    }

    public function testFindByNameScopedByFilter(): void
    {
        $this->assertCount(3, Barangays::findByName('San Isidro', ['region' => '13']));
    }

    public function testFindByNameEmptyForUnknownOrBlank(): void
    {
        $this->assertSame([], Barangays::findByName('Nonexistent Barangay XYZ'));
        $this->assertSame([], Barangays::findByName(''));
    }

    public function testListByCityMun(): void
    {
        $r = Barangays::list(['cityMunCode' => '012801']);
        $this->assertCount(1, $r);
        $this->assertSame('Adams (Pob.)', $r[0]['name']);
    }

    public function testAllCodesAreNineDigitsWithSixDigitParent(): void
    {
        foreach (Barangays::list(['region' => '13']) as $b) {
            $this->assertMatchesRegularExpression('/^\d{9}$/', $b['code']);
            $this->assertMatchesRegularExpression('/^\d{6}$/', $b['cityMunCode']);
        }
    }

    public function testManilaSubMunicipalitiesMapToManilaCity(): void
    {
        // Manila barangays carry sub-municipality codes (1339xx) but join the single
        // Manila city entry (133900) — their code does NOT prefix-match the parent.
        $exceptions = array_filter(
            Barangays::list(),
            static fn ($b) => !str_starts_with($b['code'], $b['cityMunCode']),
        );
        $this->assertCount(897, $exceptions);
        foreach ($exceptions as $b) {
            $this->assertSame('133900', $b['cityMunCode']);
        }
    }
}
