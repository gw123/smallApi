<?php
namespace core\base;

abstract class BaseCookie{

    abstract public function setCookie($key,$value,$timeout=0);

    abstract public function getCookie($key);

}