<?php

use core\App;
error_reporting(E_ALL);
$app_path = dirname(__DIR__);
define("APP_PATH",$app_path);
define("APP_ROOT_NAMESPACE",substr($app_path,strrpos($app_path,DIRECTORY_SEPARATOR)+1));

ini_set('display_errors', TRUE);
define('_DEBUG' , true);
require ("../../core/All.php");











