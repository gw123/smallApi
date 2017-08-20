<?php
define( 'ROOT_PATH' ,  str_replace("\\", "/",  dirname(dirname(__FILE__)) ) );
define( 'EOL',(PHP_SAPI == 'cli') ? PHP_EOL : '<br />' );

include (ROOT_PATH.'/lib/function.php');
include (ROOT_PATH.'/vendor/autoload.php');


//自动加载函数
function loader($class)
{
    $file = ROOT_PATH."/".$class.".php";

    if (is_file($file)) {
       require_once($file);
    }else{
       echo "not fount {$file}".EOL;
    }
}


spl_autoload_register('loader');
