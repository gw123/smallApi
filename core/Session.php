<?php
namespace core;
/**
 * Session控制类
 */
class Session{

    public static $session_start = false;
    /**
     * 设置session
     * @param String $name   session name
     * @param Mixed  $data   session data
     * @param Int    $expire 超时时间(秒)
     */
    public static function set($name, $data, $expire=600){
        if(!static::$session_start)
        {
            static::$session_start =true;
            //$ini_set =ini_get('session.auto_start');
            session_start();
        }
        $_SESSION[$name] = $data;
    }

    /**
     * 读取session
     * @param  String $name  session name
     * @return Mixed
     */
    public static function get($name){
        if(!static::$session_start)
        {
            static::$session_start =true;
            //$ini_set =ini_get('session.auto_start');
            session_start();
        }
        if(isset($_SESSION[$name])){
            return $_SESSION[$name];
        }
        return false;
    }

    /**
     * 清除session
     * @param  String  $name  session name
     */
    private static function clear($name){
        unset($_SESSION[$name]);
    }

}
?>