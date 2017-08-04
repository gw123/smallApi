<?php
namespace  core;

class Event{
    public $name;
    public $sender;
    public $data;
    public $target;

    public function __construct( $name ,$sender =null,$data =null, $target=null)
    {
        $this->name = $name;
        $this->sender = $sender;
        $this->data = $data;
        $this->target = $target;
         //echo  __CLASS__;
    }
}