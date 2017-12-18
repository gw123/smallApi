<?php
namespace core\base;

abstract class BaseResponse{
    public  $body;
    public  $header;
    abstract public function setStatus();
}