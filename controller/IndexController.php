<?php
namespace controller;
//use core\App;
use core\All;
use core\Controller;
use lib\Curl;

class  IndexController extends Controller
{
    function getIP()
    {
        if (@$_SERVER["HTTP_X_FORWARDED_FOR"])
            $ip = $_SERVER["HTTP_X_FORWARDED_FOR"];
        else if (@$_SERVER["HTTP_CLIENT_IP"])
            $ip = $_SERVER["HTTP_CLIENT_IP"];
        else if (@$_SERVER["REMOTE_ADDR"])
            $ip = $_SERVER["REMOTE_ADDR"];
        else if (@getenv("HTTP_X_FORWARDED_FOR"))
            $ip = getenv("HTTP_X_FORWARDED_FOR");
        else if (@getenv("HTTP_CLIENT_IP"))
            $ip = getenv("HTTP_CLIENT_IP");
        else if (@getenv("REMOTE_ADDR"))
            $ip = getenv("REMOTE_ADDR");
        else
            $ip = "Unknown";
        return $ip;
    }

    public  function  indexAction()
    {
        if($this->isPost())
            echo "POST 请求".EOL."\n";
        if($this->isGet())
            echo "GET 请求".EOL."\n";
        if($this->isAjax())
            echo "Ajax 请求".EOL."\n";

        $keys = ['HTTP_CLIENT_IP'   ,'HTTP_X_FORWARDED',
                 'HTTP_X_FORWARDED_FOR', 'HTTP_REMOTE_ADDR' ,
                 'HTTP_X_REQUESTED_WITH',
                 'HTTP_REFERER'];
        foreach ( $keys  as $key)
        {
            if(isset($_SERVER[$key]))
                echo $key." -> ".$_SERVER[$key].EOL."\n";
            else
                echo $key." -> "."[NULL]".EOL."\n";
        }

        echo "获取的Ip 是".$this->getIP();

        //var_dump($_SERVER);
        //$raw = file_get_contents('php://input', 'r');
        //echo $raw;
        //return $this->render('');
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

