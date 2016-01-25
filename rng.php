<?php
header('Access-Control-Allow-Origin: *');

$n = $_GET["n"];
$sep = $_GET["sep"];
if ( $sep == null ) {
    $sep = " ";
}
if ( $n == null ) {
    $a = mt_rand(0, 255);
    $b = mt_rand(0, 255);
    $c = 255 * 3 - $a - $b;
    echo $a, $sep, $b, $sep, $c;
} else {
    for( $i = 0; $i < $n; $i++ ) {
        echo mt_rand(0, 255), $sep;
    }
}
?>