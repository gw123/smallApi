<?php
namespace controller;
use core\App;
class  Index
{
    public  function  indexAction()
    {

          $rows =  App::$db->select("show databases");
          var_dump($rows);
    }
}

