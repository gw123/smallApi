<?php
namespace core;

use core\App;

class Component{

    private static $_e = [];

    public function on($eventName ,$callback){
          if(! isset( self::$_e[$eventName] ) )
          {
              self::$_e[$eventName] = [];
              self::$_e[$eventName][] = $callback;
          }else{
              if( !array_search($callback,self::$_e[$eventName]) )
              {
                  self::$_e[$eventName][] = $callback;
              }else{
                  App::$log->out( $callback.'该方法已经注册' );
              }
          }
    }

    public function trigger($eventName ,$data=null){
        $event = new Event($eventName , $this ,$data);
        $this->raiseEvent($eventName , $event );
    }

    /***
     * @param $name
     * @param $event
     * @throws BaseException
     */
    public function raiseEvent($name,$event){
        $name=strtolower($name);
        //_e这个数组用来存所有事件信息
        if(isset($this->_e[$name]))  {
            foreach($this->_e[$name] as $handler) {
                if(is_string($handler)){
                    call_user_func($handler,$event);
                } elseif(is_callable($handler,true)){
                    if(is_array($handler)){
                        // an array: 0 - object, 1 - method name
                        list($object,$method)=$handler;
                        if(is_string($object)) // static method call
                            call_user_func($handler,$event);
                        elseif(method_exists($object,$method))
                            $object->$method($event);
                        else
                            throw new BaseException("Component->raiseEvent :: class {$object} do not have method:{$method} ");
                    }
                    else // PHP 5.3: anonymous function
                        call_user_func($handler,$event);
                } else {
                    throw new BaseException('Component->raiseEvent ::'. $handler . 'cannot call');
                }
                // stop further handling if param.handled is set true
                if(($event instanceof Event) && $event->handled)
                    return;
            }
        }  elseif( _DEBUG && !$this->hasEvent($name)){
            throw new BaseException('Component->raiseEvent :: event '. $name . 'is not defined ');
        }
    }

    public function hasEvent($eventName){
        return isset( self::$_e[$eventName] );
    }

}