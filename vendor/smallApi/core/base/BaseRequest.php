<?php
namespace core\base;

abstract class BaseRequest{
    public $header;
    public $body;

    public function  __construct($header ,$body )
    {
        $this->$header = $header;
        $this->body = $body;
    }

    abstract public function getBody();
    abstract public function getHeader();


}