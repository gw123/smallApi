<?php
namespace core;
use core\exceptions\InvalidConfigException;
define( 'ROOT_PATH' ,  str_replace("\\", "/",  dirname(dirname(__FILE__)) ) );
define( 'EOL',(PHP_SAPI == 'cli') ? PHP_EOL: '<br />'."\n" );
include (ROOT_PATH.'/lib/function.php');


/***
 * Class App
 * @package core
 */
class All{
    /***
     * @var \core\App
     */
    public  static $app;
    /***
     * @var \core\Container
     */
    public  static $container;

    /**
     * @var array the attached event handlers (event name => handlers)
     */
    public  static  $_events = [];

    //自动加载函数
    public  static  function autoload($class)
    {
        $file = ROOT_PATH."/".$class.".php";

        if (is_file($file)) {
            require_once($file);
        }else{
            echo "没有找到类文件 {$file}".EOL;
        }
    }

    public static function createObject($type, array $params = [])
    {

        if (is_string($type)) {
            return static::$container->get($type, $params);
        } elseif (is_array($type) && isset($type['class'])) {
            $class = $type['class'];
            unset($type['class']);
            return static::$container->get($class, $params, $type);
        } elseif (is_callable($type, true)) {
            return static::$container->invoke($type, $params);
        } elseif (is_array($type)) {
            throw new InvalidConfigException('Object configuration must be an array containing a "class" element.');
        }

        throw new InvalidConfigException('Unsupported configuration type: ' . gettype($type));
    }


   public static function  exceptionHandel( $e)
    {
        $traces = $e->getTrace();
        //var_dump($traces);return;

        echo $e->getMessage().EOL;
        echo "On line: ".$e->getLine()." File:".$e->getFile().EOL;

        foreach ($traces as $trace)
        {
            if(isset($trace['file']))
                echo "  Line: ".$trace['line']." File:".$trace['file'].EOL;
            else
            {
                echo "funtion: ".$trace['function']." args: ";
                foreach ($trace['args'] as $arg)
                    echo $arg.EOL;
            }

        }
    }

}

#spl autoload  类的查找顺序应该是 先从后面注册的加载函数开始
spl_autoload_register([ALL::class, 'autoload'], true, true);
include (ROOT_PATH.'/vendor/autoload.php');

set_exception_handler(array(ALL::class , 'exceptionHandel'));
$config = require ("../config/config.php");
#var_dump($config);
// 下面两句顺序不能颠倒
All::$container = new Container();
All::$app = new App($config);
All::$app->run();


