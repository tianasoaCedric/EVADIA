<?php
$im = imagecreatefrompng(__DIR__.'/public/images/evadia-logo-email.png');
$w = imagesx($im); $h = imagesy($im);
$nonTransparent = 0;
$sampleColors = [];
for ($x = 0; $x < $w; $x += 20) {
    for ($y = 0; $y < $h; $y += 20) {
        $rgba = imagecolorat($im, $x, $y);
        $a = ($rgba >> 24) & 0x7F;
        if ($a < 100) {
            $nonTransparent++;
            $r = ($rgba >> 16) & 0xFF;
            $g = ($rgba >> 8) & 0xFF;
            $b = $rgba & 0xFF;
            $sampleColors[] = "$r,$g,$b,a$a";
        }
    }
}
echo "size: {$w}x{$h}\n";
echo "non-transparent samples: $nonTransparent\n";
echo "sample colors: " . implode(' | ', array_slice($sampleColors, 0, 10)) . "\n";
