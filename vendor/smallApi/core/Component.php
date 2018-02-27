<?php
namespace core;

use core\App;
use core\Event;

class Component{

    static $_e = [];



    public function on($name, $handler, $data = null, $append = true)
    {
        if ($append || empty($this->_e[$name])) {
            $this->_e[$name][] = [$handler, $data];
        } else {
            array_unshift($this->_e[$name], [$handler, $data]);
        }
    }

    public function off($name, $handler = null)
    {
        if (empty($this->_e[$name])) {
            return false;
        }
        if ($handler === null) {
            unset($this->_e[$name]);
            return true;
        }

        $removed = false;
        foreach ($this->_e[$name] as $i => $event) {
            if ($event[0] === $handler) {
                unset($this->_e[$name][$i]);
                $removed = true;
            }
        }
        if ($removed) {
            $this->_e[$name] = array_values($this->_e[$name]);
        }
        return $removed;
    }


    public function trigger($name, Event $event = null)
    {
        if (!empty($this->_e[$name])) {
            if ($event === null) {
                $event = new Event;
            }
            if ($event->sender === null) {
                $event->sender = $this;
            }
            $event->handled = false;
            $event->name = $name;
            foreach ($this->_e[$name] as $handler) {
                $event->data = $handler[1];
                call_user_func($handler[0], $event);
                // stop further handling if the event is handled
                if ($event->handled) {
                    return;
                }
            }
        }
        // invoke class-level attached handlers
        Event::trigger($this, $name, $event);
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