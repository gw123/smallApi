<?php
namespace core;

class BaseException extends \Exception
{
    public function __construct($message = "", $code = 0, Exception $previous = null) {
        parent::__construct($message ,$code,$previous);
    }

    public function __toString()
    {
        $msg = $this->getMessage();
        return $msg;
    }

}