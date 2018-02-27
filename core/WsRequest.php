<?php
namespace core;
use \All;
/**
*  兼容层 隔离不同的请求
 */
class  WsRequest
{
    public $request;
    public $server;
    private $_session;
    private $_session_id;

    public $_fd;
    public $_finish;
    public $_opcode;

    public $_request_data;
    public $_header;

    public $_path_info;

    public $_controller;
    public $_action;

    public function __construct(&$request ,&$server=null)
    {
        if(!$server) {
            $server = All::$server;
        }
        $this->server = $server;
        $this->request = $request;
        $this->_fd     = $request->fd;
        $this->_finish = $request->finish;
        $this->_opcode = $request->opcode;
        $this->_request_data = json_decode( $request->data,true);
        $this->parseRequest($request->data);
    }

    public function  parseRequest($request)
    {
        if( isset($request->server['query_string']) ){
            $this->_path_info = $request['path_info'];
        }
    }

    /**
     * 模拟实现session 机制
     */
    public  function  session_start()
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
        $sessionId = '';
        if( isset( $this->_request_data['access_token'] ) ) {
            $sessionId = $this->_request_data['access_token'];
        }

        if( strpos($sessionId ,SESSION_ID_PRE) === false){
            $sessionId = '';
        }

        if(empty($sessionId)) {
           return '';
        }

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

