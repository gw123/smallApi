<?php
namespace  core;

/***
 * Class App
 * @package core
 */
class App{
    /***
     * @var \lib\Log
     */
     public static $log;

     public static $config = array();

    /***
     * @var \core\db\Mysql;
     */
     public static   $db  = null;
    /***
     * @var \core\db\Mysql;
     */
     public static   $db_ecstore = null;
     public  static  $param = array();
     private static  $property= array();
    
     public static  function run($config)
     {
         static::$config  = $config;
         static::$db      =  new  \core\db\Mysql(static::$config['db']);
         static::$db_ecstore      =  new  \core\db\Mysql(static::$config['ecstore']);
         static::$log     =  new  \lib\Log();

         static::$param   =  $config['param'];

         \core\Router::run();
     }

     public   function getConfig($key)
     {
         if(isset(static::$config[$key]))
         {
            return static::$config;
         }
         return null;
     }

     public   function get($name)
     {
         return static::$property[$name];
     }

     public   function set($name, $value)
     {
         static::$property[$name] = $value;
     }

}