<?php
namespace debug\controller;
use core\WsController;
use \All;

class  TestController extends WsController
{

    public  function  indexAction()
    {
        $responseData = ['type'=>'indexAction'];
        $last_time = date('Y-m-d h:i:s',time());
        $responseData['last_time'] = $last_time;
        $this->session->setSession('last_time',$last_time);
        return $responseData;
    }

    public function testAction()
    {
        $item = ['msg'=>'testAction'];
        return $item;
    }
}

