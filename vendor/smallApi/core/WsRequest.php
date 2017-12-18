<?php
namespace core;
use \All;
/**
*  兼容层 隔离不同的请求
 */
class  WsRequest
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
        $this->redis = \ALL::$app->redis->connection;
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




}




