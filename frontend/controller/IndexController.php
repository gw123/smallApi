<?php
namespace frontend\controller;
use core\All;
use core\Controller;
use lib\Curl;

class  IndexController extends Controller
{

    public  function  indexAction()
    {
        if($this->isPost())
            echo "POST 请求".EOL."\n";
        if($this->isGet())
            echo "GET 请求".EOL."\n";
        if($this->isAjax())
            echo "Ajax 请求".EOL."\n";

        return $this->render('index');
    }

    public function   uploadAction()
    {
      if($this->isPost())
      {
          var_dump($_FILES);
          //echo $_FILES['pic']['name'];
          $str = strrpos($_FILES['pic']['name'],'.',-1  );
          $name = substr($_FILES['pic']['name'],0,$str);
          //echo $name;
          $name = $name.rand(1000,9000);
          $path = ROOT_PATH.'/public/files/'.$name.".png";
          move_uploaded_file($_FILES['pic']['tmp_name'] ,$path);
      }else{
          echo "GET";
      }
    }

    public function    testAction()
    {
        $container = new \core\Container();
        All::$app->get('db');
        return $this->render('index');
        #new Curl('s123');
        #$container->set('lib\curl',['a'=>1]);
        #$curl= $container->get('lib\curl',['http://baidu.com','false']);
        //$curl= $container->get('lib\curl',['http://baidu.com']);
        //var_dump($curl);
        #$container->set('controller\AdminController');
    }
}

