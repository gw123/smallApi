<?php
use core\exceptions\InvalidConfigException;
//依赖 Yii框架的 MODEL
require_once( CORE_PATH.'/core/Yii.php');
/***
 * 全局应用 所有请求共用类
 * Class BaseApp
 */
class All{

    public static  $routers ;

    /***
     * @var \core\App;
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
        $class = str_replace( '\\' , '/' , $class );
        //支持yii 命名空间
        $class = str_replace( 'yii/' ,'core/',$class );
        if( strpos($class,'core') === 0 )
        {
            $file = CORE_PATH.'/'.$class.'.php';
        }else{
            $file = ROOT_PATH."/".$class.".php";
        }

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

    /***
     * 调度路由
     * @param $request
     * @param $response
     * @return bool
     */
    public static function dispatch(&$request , &$response)
    {
        //Log::info( 'dispatch');
        $routeMap = \core\Router::parseRouter($request->server['path_info']);

        if( !$routeMap ){
            $response->header( "HTTP/1.1 404" ,"Not Found" );
            $response->header( 'Content-type',' text/html;charset=utf-8' );
            $response->header('Location','404.html');
            $response->end('404 not found!');
            return;
        }

        $controller = $routeMap[0];
        $action = $routeMap[1];
        $controllerFile = APP_PATH."/controller/".$controller."Controller".".php";

        // Log::info($request->header);

        if(!is_file($controllerFile)) {
            \All::waring("Controller :: $controllerFile  not exist !" ,__FILE__,__LINE__);
            return false;
        }
        /**注意反斜杠转义的问题*/
        $controllerStr = APP_ROOT_NAMESPACE.'\\'.'controller\\'.$controller."Controller";

        $request    = new core\Request($request,$response);
        $request->_action = $action;
        $request->_controller = $controller;

        $controller = new $controllerStr( $request );

        $action   = $action."Action";

        if(!method_exists($controller,$action)) {
            \All::waring("function:: {$controllerStr}->{$action}  not exist !" ,__FILE__,__LINE__);
            return false;
        }
        $result = $controller->$action( );
        $response->end($result);

    }

    /***
     * 调度路由
     * @param $frame
     * @param $server
     * @return bool
     */
    public static function dispatchWs(&$frame,&$server)
    {
        $requestData = $frame->data;
        if(!($requestData = json_decode($requestData,true))) {
            $requestData = null;
        }
        //var_dump($requestData);
        if(!isset($requestData['pathinfo'])) {
            $pathinfo = '/index/index';
        }else {
            $pathinfo = $requestData['pathinfo'];
        }
        //echo 'pathinfo:'.$pathinfo."\n";
        $routeMap = \core\Router::parseRouter($pathinfo);
        $response = new \core\WsResponse($server,$frame->fd);
        if(isset($requestData['cookie'])) {
              $cookie_data = $requestData['cookie'];
        } else {
              $cookie_data = ['session_id'=>''];
        }
        $cookie  = new \core\WsCookie($cookie_data);
        $response->setCookie($cookie->getCookie());

        if(!$routeMap ) {
             $responseData = [
                'status'=>404,
                'msg'=>'访问内容不存在'
             ];
            $response->output($responseData);
            return;
        }

        $controller = $routeMap[0];
        $action = $routeMap[1];
        $controllerFile = APP_PATH."/controller/".$controller."Controller".".php";
        if(!is_file($controllerFile)) {
            \All::waring("Controller :: $controllerFile  not exist !" ,__FILE__,__LINE__);
            return false;
        }
        /**注意反斜杠转义的问题*/
        $controllerStr = APP_ROOT_NAMESPACE.'\\'.'controller\\'.$controller."Controller";

        //var_dump('cookie_data:',$cookie_data);
        $session = new \core\WsSession($cookie->getSessionId());
        //更新session_id
        $cookie->setCookie('session_id' ,$session->session_id);
        $request = new \core\WsRequest($server);
        $request->_action = $action;
        $request->_controller = $controller;


        $controller = new $controllerStr($request ,$response,$session,$cookie );
        $action   = $action."Action";
        if(!method_exists($controller,$action))
        {
            \All::waring("function:: {$controllerStr}->{$action}  not exist !" ,__FILE__,__LINE__);
            return false;
        }
        $result = $controller->$action( );
        $response->setCookie($cookie->getCookie());
        $response->output($result);
    }

    public static function waring($msg)
    {
        echo "{$msg}\n";
    }
}

//function initApp()
//{
//    //自定义路由
//    All::$routers = require( ROOT_PATH."/config/route.php" );
//    spl_autoload_register([All::class, 'autoload'], true, true);
//
//    if ( is_file(ROOT_PATH.'/vendor/autoload.php'))
//        include (ROOT_PATH.'/vendor/autoload.php');
//    else
//        echo ROOT_PATH.'/vendor/autoload.php'." 不存在\n";
//    #spl autoload  类的查找顺序应该是 先从后面注册的加载函数开始
//    set_exception_handler(array(All::class , 'exceptionHandel'));
//
//    // 下面两句顺序不能颠倒
//    All::$container = new  \core\Container();
//    $config = require ( ROOT_PATH."/config/config.php" );    #var_dump($config);
//    All::$app  = new App($config);
//}
//
//initApp();



