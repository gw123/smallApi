<?php
namespace debug\controller;
use core\WsController;


class  IndexController extends WsController
{

    public function  indexAction()
    {
        $response = ['data' => 'indexAction'];
        return $response;
    }

}
