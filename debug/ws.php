<?php
//微服务入口
define( 'ENTRY_FILENAME' ,str_replace("\\", "/", __FILE__ ));
define( 'APP_PATH'  ,    dirname(__FILE__) );
define( 'ROOT_PATH' ,    dirname(APP_PATH) );
define( "APP_ROOT_NAMESPACE",'\\'.substr(APP_PATH,strrpos(APP_PATH,DIRECTORY_SEPARATOR)+1));

define( 'VENDOR_PATH' ,  ROOT_PATH.'/vendor' );
define( 'EOL',(PHP_SAPI == 'cli') ? PHP_EOL: '<br />'."\n" );
//include (ROOT_PATH.'/lib/function.php');

/*** 实现 session 机制*/
define( 'SESSION_COOKIE_NAME','SMALLAPI_SES');
define( 'SESSION_ID_PRE','SESSION_');

define( 'CORE_PATH' , VENDOR_PATH.'/smallApi' );
//
require( CORE_PATH.'/core/All.php');

/***
 * 初始化框架
 */
function initApp()
{
    //自定义路由
    All::$routers = require( ROOT_PATH."/config/route.php" );
    spl_autoload_register([All::class, 'autoload'], true, true);

    if ( is_file(ROOT_PATH.'/vendor/autoload.php') )
        include (ROOT_PATH.'/vendor/autoload.php');
    else
        echo ROOT_PATH.'/vendor/autoload.php'." 不存在\n";

    #spl autoload  类的查找顺序应该是 先从后面注册的加载函数开始
    set_exception_handler(array(All::class , 'exceptionHandel'));

    $commonConfig   = require_once ( ROOT_PATH."/config/config.php" );    #var_dump($config);
    $appConfig      = require_once ( APP_PATH."/config/config.php" );
    //\Log::info($commonConfig);
    //\Log::info($appConfig);
    $config['components']  = array_merge( $commonConfig['components'] , $appConfig['components']);
    $config['params']  = array_merge( $commonConfig['params'] , $appConfig['params']);
    // 下面两句顺序不能颠倒
    All::$container = new  \core\Container();
    All::$app       =  new core\App($config);
}

initApp();

//初始化ws服务器
require_once( CORE_PATH.'/wsEntry.php');



