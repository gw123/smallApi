<?php
namespace controller;
use core\App;
use core\Controller;

class  IndexController extends Controller
{
    public  function  indexAction()
    {
          $rows =  App::$db->select("show databases");
          //var_dump($rows);

          return $this->render('');
    }
}

