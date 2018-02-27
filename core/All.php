<?php
use core\exceptions\InvalidConfigException;

//依赖 Yii框架的 MODEL
require_once(CORE_PATH.'/core/Yii.php');
error_reporting(E_ALL);

/***
 * 输出框架执行流程
 * @param $place
 */
function logger_running($place)
{
    $pid = getmypid();
    $msg =  "[Pid ".$pid."] ".$place."\n";
    All::logger($msg, 'sys_running');
}

/***
 * 全局应用 所有请求共用类
 */
class All {
    /***
     * @var \Swoole\Table
     */
    public static $web_socket_fds;
    /***
     * @var Swoole\Channel
     */
    public static $channel;

    public static $routers ;
    /***
     * @var \core\App;
     */
    public static $app;

    /***
     * @var swoole_http_server;
     */
    public static $server;

    public static $server_config;

    /***
     * @var \core\Container
     */
    public static $container;

    /**
     * @var array the attached event handlers (event name => handlers)
     */
    public static $_events = [];

    //自动加载函数
    public static function autoload($class)
    {
        $class = str_replace('\\', '/', $class);
        //支持yii 命名空间
        $class = str_replace('yii/', 'core/', $class );
        if(strpos($class, 'core') === 0) {
            $file = CORE_PATH.'/'.$class.'.php';
        } else {
            $file = ROOT_PATH."/".$class.".php";
        }

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

    public static function exceptionHandel($e)
    {
        $traces = $e->getTrace();
        $lines = [];
        $lines[] =  $e->getMessage().EOL;
        $lines[] =  "On line: ".$e->getLine()." File:".$e->getFile().EOL;

        foreach ($traces as $trace) {
            if(isset($trace['file'])){
                $lines[] = "  Line: ".$trace['line']." File:".$trace['file'].EOL;
            } else {
                $lines[] = "funtion: ".$trace['function']." args: ";
                foreach ($trace['args'] as $arg)
                    $lines[] =  $arg.EOL;
            }
        }
        echo implode("\n", $lines);
        All::logger($lines,'sys_exception');
    }

    /***
     * 调度路由
     * @param $request
     * @param $response
     * @return bool
     */
    public static function dispatch(&$request, swoole_http_response &$response)
    {
        $begin_time = microtime(true);
        $request_data['path_info'] = $request->server['path_info'] ;
        $request_data['post'] = $request->post;
        $request_data['header'] = $request->header;
        $request_data['get'] = $request->get;

        $routeMap = \core\Router::parseRouter($request->server['path_info']);

        if(!$routeMap){
            $response->header("HTTP/1.1 404" ,"Not Found" );
            $response->end('404 not found!');
            return false;
        }

        $controller = $routeMap[0];
        $action = $routeMap[1];
        $controllerFile = APP_PATH."/controller/".$controller."Controller".".php";

        if(!is_file($controllerFile)) {
            \All::error("Controller :: $controllerFile  not exist ! 请检查文件是否存在" ,__FILE__,__LINE__);
            $result = ['code'=>\api\service\Code::NotFound,'msg'=>'请求地址不存在'];
            $response->end(json_encode($result));
            return false;
        }
        /**注意反斜杠转义的问题*/
        $controllerStr = APP_ROOT_NAMESPACE.'\\'.'controller\\'.$controller."Controller";
        if(!class_exists($controllerStr)){
            \All::error("function:: {$controllerStr}->{$action}  not exist ! 请检测文件名和类名是否相同" ,__FILE__,__LINE__);
            $result = ['code'=>\api\service\Code::NotFound,'msg'=>'请求地址不存在'];
            $response->end(json_encode($result));
            return false;
        }
        $request  = new core\Request($request);
        $request->_action = $action;
        $request->_controller = $controller;
        $controller = new $controllerStr($request, $response);
        //$http_response->cookie(string $key, string $value = '', int $expire = 0 , string $path = '/', string $domain  = '', bool $secure = false , bool $httponly = false);
        $response->cookie(SESSION_COOKIE_NAME, $request->getSessionId());
        $action = $action."Action";
        if(!method_exists($controller, $action)) {
            \All::error("function:: {$controllerStr}->{$action}  not exist ! 请检测该类是否存在这样的方法" ,__FILE__,__LINE__);
            $result = ['code'=>\api\service\Code::NotFound,'msg'=>'请求地址不存在'];
            $response->end(json_encode($result));
            return false;
        }

        $result = $controller->$action();
        $response->header('Content-Type','text/html;charset=utf-8');
        $response->end($result);

        $end_time = microtime(true);
        $request_data['use_time'] = (round($end_time-$begin_time,4)*1000).'ms';
        //过滤掉test控制器的输出
        if($routeMap[0] != 'Debug'){
            All::logger($request_data ,'sys_info');
        }
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
        if(!($requestData = json_decode($requestData, true))) {
            $requestData = null;
        }
        $response = new \core\WsResponse($server, $frame->fd);
        if(!isset($requestData['pathinfo'])) {
            $responseData = [ 'msg'=>'未设置pathinfo'];
            $response->output($responseData, 404);
            \All::error("dispathWs: " ,__FILE__,__LINE__);
            return;
        } else {
            $pathinfo = $requestData['pathinfo'];
        }

        $routeMap = \core\Router::parseRouter($pathinfo);

        if(!$routeMap) {
            $responseData = [  'msg'=>'访问内容不存在'];
            $response->output($responseData , 404);
            return;
        }

        $controller = $routeMap[0];
        $action = $routeMap[1];

        $controllerFile = APP_PATH."/controllerWs/".$controller."Controller".".php";
        if(!is_file($controllerFile)) {
            \All::error("Controller :: $controllerFile  not exist !" , __FILE__, __LINE__);
            $responseData = [ 'msg'=>'访问内容不存在'];
            $response->output($responseData , 404);
            return false;
        }
        /**注意反斜杠转义的问题*/
        $controllerStr = APP_ROOT_NAMESPACE.'\\'.'controllerWs\\'.$controller."Controller";
        $request = new \core\WsRequest($frame,$server);
        $request->_action = $action;
        $request->_controller = $controller;

        $controller = new $controllerStr($request, $response);
        $action   = $action."Action";

        if(!method_exists($controller,$action)) {
            \All::error("function:: {$controllerStr}->{$action}  not exist !" , __FILE__, __LINE__);
            $responseData = [  'msg'=>'访问方法不存在'];
            $response->output($responseData, 404);
            return false;
        }
        $result = $controller->$action();
        if(!empty($result)){
            $response->output($result);
        }
    }

    /***
     * 创建一个新的任务
     * @param $class
     * @param $data
     */
    public  static function  task($class,$data)
    {
        $task['class'] = $class;
        $task['data'] = $data;
        All::$server->task($task);
    }

    /***
     * 输出调试日志
     * @param $content array|string  日志内容可
     * @param string $group          日志分类
     * @param int $fd                指定客户端
     */
    public static function  logger($content,$group='info',$fd=0)
    {
        $task['type'] = 'logger';
        $task['data'] = $content;
        $task['group'] = $group;
        $task['fd'] = $fd;
        All::$channel->push($task);
    }

    /***
     * 向一个websocket 客户端发送消息
     * @param $fd
     * @param $data
     * @param string $type
     * @param string $group
     * @param int $status
     */
    public static function push($fd , $data, $type='log', $group='sys', $status=200)
    {
        $frame['type'] = $type;
        $frame['group'] = $group;
        $frame['status'] = $status;
        if(is_array($data) || is_object($data)){
            $frame['contentType'] = 'json';
            $frame['data'] = $data;
        }else{
            $frame['contentType'] = 'text';
            $frame['data'] = $data;
        }
        All::$server->push($fd, json_encode($frame));
    }

    public static function waring($msg ,$file = '' ,$line = 0)
    {
        $data['place'] = "FILE :".$file." : ".$line;
        $data['msg'] = $msg;
        All::logger($data ,'sys_waring');
    }

    public static  function  info($msg ,$file = '' ,$line = 0)
    {
        $data['place'] = "FILE :".$file." : ".$line;
        $data['msg'] = $msg;
        All::logger($data ,'sys_info');
    }

    public static  function  error($msg ,$file = '' ,$line = 0)
    {
        $data['place'] = "FILE :".$file." : ".$line;
        $data['msg'] = $msg;
        All::logger($data ,'sys_error');
    }

    /***
     * 修改动态配置
     * @param $key
     * @param $value
     */
    public static function setConfig($key,$value)
    {
        All::$app->redis->hSet('dynamic_params',$key,$value);
    }

    /***
     * 获取动态配置的内容  静态配置可以通过 All::$app->params['keyname'] 来获取
     * @param $key
     * @return false|string
     */
    public static function  getConfig($key)
    {
        return  All::$app->redis->hGet('dynamic_params',$key);
    }
}

set_exception_handler(array(All::class , 'exceptionHandel'));

/***
 * 类自动加载的实现
 */
spl_autoload_register([All::class, 'autoload'], true, true);

if ( is_file(ROOT_PATH.'/vendor/autoload.php') )
{
    include (ROOT_PATH.'/vendor/autoload.php');
}else {
    echo ROOT_PATH.'/vendor/autoload.php'." 不存在\n";
}

/***
 * 框架的容器
 */
All::$container = new  \core\Container();

/***
 * 加载server配置文件，修改server配置文件只能在重启入口脚本后生效
 */
All::$server_config = require ( APP_PATH."/config/server.php" );

/***
 * 加载服务器
 */
require_once(CORE_PATH.'/server.php');







