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
require( CORE_PATH.'/core/Yii.php');
/***
 * 初始化框架
 */
function initApp()
{
    spl_autoload_register([All::class, 'autoload'], true, true);

    if ( is_file(ROOT_PATH.'/vendor/autoload.php') ) {
        include (ROOT_PATH.'/vendor/autoload.php');
    } else {
        echo ROOT_PATH.'/vendor/autoload.php'." 不存在\n";
    }

    set_exception_handler(array(All::class , 'exceptionHandel'));
    // 下面两句顺序不能颠倒
    All::$container = new  \core\Container();
    $commonConfig   = require ( ROOT_PATH."/config/config.php" );
    $appConfig      = require ( APP_PATH."/config/config.php" );
    $config['components']  = array_merge( $commonConfig['components'] , $appConfig['components']);
    $config['params']  = array_merge( $commonConfig['params'] , $appConfig['params']);
    All::$app       =  new core\App($config);
}
require_once ( APP_PATH.'/console.php');
initApp();

