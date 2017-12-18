<?php        // TODO: Implement getSession() method.

namespace core;

use core\base\BaseSession;

class  WsSession extends  BaseSession{

    public $data;
    public $session_id;

    public function __construct($data , $session_id='')
    {
        $this->session_id = $session_id;
        $this->data = $data;
    }

    public function setSession($key, $value, $timeout = 0)
    {
        $this->data[$key] = $value;
    }

    public function getSession($key)
    {
        if(!isset($this->data[$key])) {
            return null;
        }

        return $this->data[$key];
    }

     /**
    * 模拟实现session 机制
    */
    public function startSession()
    {
        if(empty($this->session_id) )
        {
            $sessionId = $this->session_id;
        }else {
            $sessionId = $this->makeSessionId();
            $this->session_id = $sessionId;
        }

        $this->data = $this->redis->hGetAll($sessionId);
        if( empty($this->data) )
        {
            $this->redis->hSet( $sessionId  ,'id' , $sessionId );
        }else {
            $this->data = [];
        }
        //echo $sessionId."\n";
    }

    /***
     * 生成sessionID
     * @return string
     */
    public function makeSessionId()
    {
        $time =  microtime();
        $rand = rand(0,10000000);
        return SESSION_ID_PRE.md5($time.$rand);
    }

}