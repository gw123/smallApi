<?php
namespace core;
use core\app;
use core\All;
/**
*  兼容层 隔离不同的请求
 */
class  Request
{
    public  $request;
    public  $response;
    public  $redis;
    public  $db;

    private $_cookie;
    private $_session;
    private $_session_id;

    public  $_get;
    public  $_post;
    public  $_header;

    public  $_query_string;
    public  $_path_info ;
    public  $_method;

    public  $_controller;
    public  $_action;

    public  function __construct(&$request ,&$response)
    {
        $this->request = $request;
        $this->response = $response;
        $this->redis = ALL::$app->redis->connection;
        $this->db = ALL::$app->db;
        $this->parseRequest($request);
        $this->session_start();
    }

    public  function  parseRequest( &$request )
    {
        $this->_cookie = $request->cookie;
        $this->_get = $request->get;
        $this->_post = $request->post;
        $this->_header = $request->header;

        $this->_method = $request->server['request_method'];
        $this->_path_info =$request->server['path_info'];
        if( isset($request->server['query_string']) )
            $this->_query_string = $request->server['query_string'];
    }

    /**
    * 模拟实现session 机制
    */
    public  function  session_start(  )
    {
        if( !empty($this->request->cookie) && isset( $this->request->cookie['SMALLAPI_SES'] ) )
        {
            $sessionId = $this->request->cookie[ SESSION_COOKIE_NAME ];
        }else{
            $sessionId = $this->makeSessionId();
            #http_response->cookie(string $key, string $value = '', int $expire = 0 , string $path = '/', string $domain  = '', bool $secure = false , bool $httponly = false);
            $this->response->cookie( SESSION_COOKIE_NAME, $sessionId );
        }

        $this->_session = $this->redis->hGetAll($sessionId);
        if( empty($this->_session) )
        {
            $this->redis->hSet( $sessionId  ,'id' , $sessionId );
        }else{
            $this->_session = [];
        }
        //echo $sessionId."\n";
        $this->_session_id = $sessionId;
    }
    /***
     * 生成sessionID
     * @return string
     */
    private  function makeSessionId()
    {
        $time =  microtime();
        $rand = rand(0,10000000);
        return SESSION_ID_PRE.md5($time.$rand);
    }

    public  function setSession($key ,$value)
    {
        if(!empty($this->_session_id))
         $this->redis->hSet( $this->_session_id  ,$key , $value );
    }

    public  function  getSession($key)
    {
        if( !empty($this->_session_id) )
            return $this->redis->hGet( $this->_session_id ,$key);
    }

    /****
     *  解析并且调用路由
     */
    public function runRouter()
    {
        $url = $this->_path_info;
        $url = str_replace('\\','/',$url);
        $url = str_replace('/api.php','',$url);

        if( strpos($url,'?') )
            $url = substr( $url , 0, strpos($url , '?'));

        // 优先静态路由
        if( array_key_exists($url , ALL::$routers ) )
        {
            $url = ALL::$routers[$url];
        }

        $tempPath = explode('/',$url);
        array_shift( $tempPath );

        $controller = isset($tempPath[0])&&!empty($tempPath[0]) ? $tempPath[0] :'Index';
        $action = isset($tempPath[1])&&!empty($tempPath[1]) ? $tempPath[1] :'Index';
        $controller = ucfirst($controller);
        $action = ucfirst($action);

        $this->_controller = $controller;
        $this->_action = $action;

        $controllerFile = APP_PATH."/controller/".$controller."Controller".".php";
        if(!is_file($controllerFile))
        {
            All::waring("Controller :: $controllerFile  not exist !" ,__FILE__,__LINE__);
            return false;
        }
        /**注意反斜杠转义的问题*/
        $controllerStr = APP_ROOT_NAMESPACE.'\\'.'controller\\'.$controller."Controller";
        $controller =    new $controllerStr( $this );

        $action   = $action."Action";

        if(!method_exists($controller,$action))
        {
            All::waring("function:: {$controllerStr}->{$action}  not exist !" ,__FILE__,__LINE__);
            return false;
        }

        return  $controller->$action( );
    }


}




