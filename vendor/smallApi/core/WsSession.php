<?php        // TODO: Implement getSession() method.

namespace core;

use core\base\BaseSession;

class  WsSession extends  BaseSession{

    public $data;
    public $session_id;

    public function __construct( $session_id='')
    {
        //echo "WsSession __construct\n";
        $this->session_id = $session_id;
        $this->startSession();
    }

    public function setSession($key, $value, $timeout = 0)
    {
        $this->data[$key] = $value;
        \All::$app->redis->hSet( $this->session_id ,$key, $value );
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
        if(!empty($this->session_id) ) {
            $sessionId = $this->session_id;
        }else {
            $sessionId = $this->makeSessionId();
            $this->session_id = $sessionId;
        }
        $this->data = \All::$app->redis->hGetAll($sessionId);
        //var_dump('session data',$this->data);
        if( empty($this->data) ) {
            \All::$app->redis->hSet( $sessionId  ,'session_id' , $sessionId );
        }else {
            $this->data = [];
        }
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