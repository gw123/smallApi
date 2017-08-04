<?php
namespace  core;
use  controller;
class  Router {
    public  static function  run()
    {
          $controller  = _get('_c','Index');
          $action      = _get('_a','index');

          $controllerFile = ROOT_PATH."/controller/".$controller.".php";
          if(!is_file($controllerFile))
          {
              App::$log->out("Controller :: {$controller}  not exist !" ,__FILE__,__LINE__);
              exit();
          }
          /**注意反斜杠转义的问题*/
          $controller = 'controller\\'.$controller;
          $controller =    new $controller;

          $action   = $action."Action";
          if(!method_exists($controller,$action))
          {
              App::$log->out("function:: {$controller}->{$action}  not exist !" ,__FILE__,__LINE__);
              exit();
          }

          $controller->$action();
        return ;
    }
}