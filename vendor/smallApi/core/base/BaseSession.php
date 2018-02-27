<?php
namespace core\base;

if(!defined('SESSION_ID_PRE')) {
    define('SESSION_ID_PRE' , 'SESSION_ID');
}

abstract class BaseSession{
    abstract public function setSession($key ,$value,$timeout=0);
    abstract public function getSession($key);

    abstract public function startSession();

    protected function makeSessionId()
    {
        $time =  microtime();
        $rand = rand(0,10000000);
        return SESSION_ID_PRE.md5($time.$rand);
    }
}