<?php
namespace core;
use core\exceptions\InvalidConfigException;
define( 'ROOT_PATH' ,  str_replace("\\", "/",  dirname(dirname(__FILE__)) ) );
define( 'APP_PATH' ,  ROOT_PATH.'/frontend' );
define("APP_ROOT_NAMESPACE",substr(APP_PATH,strrpos(APP_PATH,DIRECTORY_SEPARATOR)+1));

define( 'EOL',(PHP_SAPI == 'cli') ? PHP_EOL: '<br />'."\n" );
include (ROOT_PATH.'/lib/function.php');


/*** 实现 session 机制*/
define('SESSION_COOKIE_NAME','SMALLAPI_SES');
define('SESSION_ID_PRE','SESSION_');

/***
 * 全局应用 所有请求共用类
 * Class BaseApp
 */
class All{

    public static  $routers ;
    /***
     * @var \core\db\Mysql;
     */
    public  static $db;

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
        $class = str_replace( '\\' , '/' , $class );
        $file = ROOT_PATH."/".$class.".php";

        if (is_file($file)) {
            require_once($file);
        }else{
            echo "没有找到类文件 {$file}".EOL;
        }
    }

    public  static  function createObject($type, array $params = [])
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

    public  static  function  exceptionHandel( $e)
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

    public  static  function waring($msg)
    {
        echo "{$msg}\n";
    }
}

function initApp()
{
    //自定义路由
    All::$routers = require( ROOT_PATH."/config/route.php" );
    spl_autoload_register([All::class, 'autoload'], true, true);

    if ( is_file(ROOT_PATH.'/vendor/autoload.php'))
        include (ROOT_PATH.'/vendor/autoload.php');
    else
        echo ROOT_PATH.'/vendor/autoload.php'." 不存在\n";
    #spl autoload  类的查找顺序应该是 先从后面注册的加载函数开始
    set_exception_handler(array(All::class , 'exceptionHandel'));

    // 下面两句顺序不能颠倒
    All::$container = new  \core\Container();
    $config = require ( ROOT_PATH."/config/config.php" );    #var_dump($config);
    All::$app  = new App($config);
}

initApp();



