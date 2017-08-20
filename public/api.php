<?php
use core\App;
error_reporting(E_ALL);
ini_set('display_errors', TRUE);
define('_DEBUG' , true);
require ("../core/autoload.php");

$config = require ("../config/config.php");

App::run($config);

return;









