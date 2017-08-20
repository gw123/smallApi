<?php
namespace  core;
use  controller;
class  Router {
    public  static function  run()
    {
        $url = $_SERVER['REQUEST_URI'];
        $url = str_replace('\\','/',$url);
        $url = str_replace('/api.php','',$url);

        if(strpos($url,'?'))
            $url = substr( $url , 0, strpos($url , '?'));
        // 优先静态路由
        $routes = require(ROOT_PATH."/config/route.php");

        if(array_key_exists($url , $routes))
        {
            $url = $routes[$url];
        }

        $tempPath = explode('/',$url);
        array_shift($tempPath);

        $controller = isset($tempPath[0]) ? $tempPath[0] :'index';
        $action = isset($tempPath[1]) ? $tempPath[1] :'index';

        define('CONTROLLER',$controller);
        define('ACTION' ,$action);
          $controllerFile = ROOT_PATH."/controller/".$controller."Controller".".php";
          if(!is_file($controllerFile))
          {
              App::$log->out("Controller :: {$controller}  not exist !" ,__FILE__,__LINE__);
              exit();
          }
          /**注意反斜杠转义的问题*/
          $controllerStr = 'controller\\'.$controller."Controller";
          $controller =    new $controllerStr;

          $action   = $action."Action";

          if(!method_exists($controller,$action))
          {
              App::$log->out("function:: {$controllerStr}->{$action}  not exist !" ,__FILE__,__LINE__);
              exit();
          }

           echo  $controller->$action();
        return ;
    }
}