<?php
namespace core;
use \All;
/**
*  兼容层 隔离不同的请求
 */
class  Request
{
    /***
     * @var \swoole_http_request
     */
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
    public  $_files;

    public  $_query_string;
    public  $_path_info ;
    public  $_method;

    public  $_controller;
    public  $_action;
    public  $_client_ip;

    public  function __construct(&$request ,&$response)
    {
        $this->request = $request;
        $this->response = $response;

        $this->parseRequest($request);
        $this->session_start();
    }

    public  function  parseRequest( &$request )
    {
        $this->_cookie = $request->cookie;
        $this->_get = $request->get;
        //'content-type': 'application/x-www-form-urlencoded' 不支持application/json
        $this->_post = $request->post;
        $this->_files = $request->files;
        $this->_header = $request->header;

        $this->_method = $request->server['request_method'];
        $this->_path_info =$request->server['path_info'];
        if( isset($request->server['query_string']) ){
            $this->_query_string = $request->server['query_string'];
        }

        if(defined('SERVER_AGENT')&&SERVER_AGENT){
             if(isset($request->header['x-real-ip'])){
                 $this->_client_ip = $request->header['x-real-ip'];
             }else{
                 $this->_client_ip = $request->server['remote_addr'];
             }
        }else{
            $this->_client_ip = $request->server['remote_addr'];
        }
    }

    /**
    * 模拟实现session 机制
    */
    public  function  session_start(  )
    {
        $sessionId = $this->getSessionId();
        if(empty($sessionId)){
            $this->_session = [];
            return ;
        }
        $this->_session = \ALL::$app->redis->hGetAll($sessionId);
        if( empty($this->_session) )
        {
            \ALL::$app->redis->hSet( $sessionId  ,'id' , $sessionId );
        }else{
            $this->_session = [];
        }
        //echo $sessionId."\n";
        $this->_session_id = $sessionId;
    }

    public function getSessionId()
    {
        if($this->_session_id){
            return $this->_session_id;
        }
        if(defined("SESSION_TYPE")&&SESSION_TYPE=='get'){
            $sessionId = isset($this->_get['access_token'])?$this->_get['access_token']:'';
        }else if( !empty($this->request->cookie) && isset( $this->request->cookie['SMALLAPI_SES'] ) ) {
            $sessionId = $this->request->cookie[ SESSION_COOKIE_NAME ];
        }

        if( strpos($sessionId ,SESSION_ID_PRE) === false){
            $sessionId = '';
        }

        if(empty($sessionId)) {
            $sessionId = $this->makeSessionId();
            #http_response->cookie(string $key, string $value = '', int $expire = 0 , string $path = '/', string $domain  = '', bool $secure = false , bool $httponly = false);
            $this->response->cookie( SESSION_COOKIE_NAME, $sessionId );
        }
        echo "Session id :".$sessionId."\n";
        $this->_session_id = $sessionId;
        return $sessionId;
    }
    /***
     * 生成sessionID
     * @return string
     */
    private  function makeSessionId()
    {
        do{
            $time =  microtime();
            $rand =  rand(10000000,90000000);
            $session_id = SESSION_ID_PRE.md5($time.$rand."xyt");
        }while(All::$app->redis->hExists( $session_id,'id'));
        return $session_id;
    }

    public  function setSession($key ,$value)
    {
        $this->_session_id = $this->getSessionId();
        if(!empty($this->_session_id)){
            if(is_array($value)){
                $value = json_encode($value);
            }
          return  \ALL::$app->redis->hSet( $this->_session_id  ,$key , $value );
        }
       return false;
    }

    public  function  getSession($key)
    {

        if( !empty($this->_session_id) ) {
            return \ALL::$app->redis->hGet( $this->_session_id ,$key);
        }else{
            return  false;
        }
    }

}




