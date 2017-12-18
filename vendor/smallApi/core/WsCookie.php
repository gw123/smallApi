<?php
namespace core;

use core\base\BaseCookie;

class WsCookie extends BaseCookie{

    public $data = [];
    public function __construct($data)
    {
        $this->data = $data;
    }

    /***
     * @param $key
     * @param $value
     * @param int $timeout
     */
    public function setCookie($key, $value, $timeout = 0)
    {
        $this->data[$key] = $value;
    }

    /***
     * @param $key
     * @return mix
     */
    public function getCookie($key)
    {
        if(!isset($this->data[$key])) {
            return false;
        }

        return $this->data[$key];
    }


}