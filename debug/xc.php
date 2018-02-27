<?php

function printer()
{
    $i = 0;
    while (true) {
        yield $i;
        printf("receive: %s\n", ++$i);
        if($i>=1000) {
            break;
        }
    }
}

$printer = printer();

printf("%d\n", $printer->current());
//$printer->send('hello');
printf("%d\n", $printer->current());
//$printer->send('world');
printf("%d\n", $printer->current());


foreach( $printer as $key => $val) {
    echo $key.' => '.$val."\n";
}

