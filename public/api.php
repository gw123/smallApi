<?php
use core\App;

error_reporting(E_ALL);
ini_set('display_errors', TRUE);
define('_DEBUG' , true);

require ("../core/autoload.php");

$config = require ("../config/config.php");

App::run($config);

echo App::$param['host'];


return;
$queryStr = $_SERVER['QUERY_STRING'];
$url = $_SERVER['REQUEST_URI'];
$url = substr( $url , strpos($url , '.php')+5);

$param = [];
if( $url!==false )
{
    $param =  explode('/',$url );
}

$controller   =  array_shift($param);
$action       =  array_shift($param);
define('ACTION',$action);
define('CONTROLLER' , $controller);


//var_dump($_GET);
//echo ROOT_PATH."/controller/".$controller;
include (ROOT_PATH."/controller/".$controller.".php");








