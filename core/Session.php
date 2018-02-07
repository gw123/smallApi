<?php
namespace core;
/**
 * Session控制类
 */
class Session{

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
?>