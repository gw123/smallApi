<?php
namespace  core;
use core\Component;
class   Controller extends Container {

    /***
     * @var \core\Request;
     */
    public  $request;

    public  function  __construct( $request  )
    {
        $this->request = $request;
    }

    public  function  asJson($data)
    {
        $this->header( 'Content-type','application/json' );
        return json_encode($data);
    }

    public  function  asJs($data)
    {
        $this->header( 'Content-type',' application/x-javascript; charset=utf-8' );
        return json_encode($data);
    }

    public  function  setUtf8()
    {
        $this->header( 'Content-type',' text/html;charset=utf-8' );
    }

    public function header($key ,$value)
    {
        $this->request->response->header($key,$value);
    }

    public  function  isAjax()
    {
        return isset($_SERVER["HTTP_X_REQUESTED_WITH"]) && strtolower($_SERVER["HTTP_X_REQUESTED_WITH"])=="xmlhttprequest";
    }

    public  function isPost(){

        return isset($this->request->_method) && strtolower($this->request->_method) == 'post';
    }

    public function  isGet(){
        return isset($this->request->_method) && strtolower($this->request->_method) == 'get';
    }

    public  function  redirect($url)
    {
        header('location:'.$url);
        exit();
    }

    public function error($msg ,$timeout=2 ,$status = 0 ,$viewTpl = "/site/error")
    {
        if($this->isAjax())
        {
            $ret = [ 'status'=>$status ,'msg'=>$msg ];
            return $this->asJson($ret);
        }
        $timeout =$timeout*1000;
        return  $this->render($viewTpl ,['msg'=>$msg,'timeout'=>$timeout]);
    }

    /**
     * @param $filePath
     */
    public function  render($filePath ='',$data = array() )
    {
        //设置编码
        $this->setUtf8();
        if(empty($filePath)) $filePath = $this->request->_action;

        if($filePath[0]=='/')
        {
            $filePath  = str_replace('.twig' ,'', $filePath);
            $filePath  = $filePath.".twig";
        }else{
            $filePath  = str_replace('.twig' ,'', $filePath);
            $filePath  = lcfirst($this->request->_controller)."/".$filePath.".twig";
        }

        if(!is_file(APP_PATH."/view/".$filePath))
        {
            return   "模板文件不存在 ".APP_PATH."/view/".$filePath;
        }
        //var_dump(All::$app->view);
        return All::$app->view->render($filePath,$data);
        //$loader = new Twig_Loader_String();
        //$twig =   new \Twig_Environment($loader);
        //echo $twig->render('Hello !', array('name' => 'Fabien'));

        //  $config = isset(App::$config['twig'])?App::$config['twig']:[];
        // $loader = new \Twig_Loader_Filesystem(ROOT_PATH.'/view');
        // $twig =   new \Twig_Environment($loader, $config);
        // return $twig->render($filePath, $data);

    }


    /***
     *  补全参数 , 当字段不存在使用 '' 代替
     * @param array $fields
     * @param string $method
     * @return array
     */
    public  function  getInput( $fields , $method = 'GET')
    {
        $method = strtoupper($method);
        $inputData =  $method == 'GET' ? $_GET  : $_POST;
        if(is_string($fields))
        {
            return $inputData[$fields];
        }
        $ret  = array();
        foreach ( $fields  as  $field  )
        {
            $val = isset($inputData[ $field ]) ?  $inputData [ $field ] : '' ;
            if (get_magic_quotes_gpc()) {
                $ret[ $field ] = $val;
            } else {
                if(is_array($val))
                  $ret[ $field ] = $val;
                else
                  $ret[ $field ] = stripslashes($val);
            }

        }
        return $ret;
    }


    /***  必要参数 , 没有报异常
     * @param array $fields
     * @param string $method
     * @return mixed
     * @throws BaseException
     */
    public function  requireInput(Array $fields , $method =  'GET')
    {
        $method = strtoupper($method);
        $inputData =  $method == 'GET' ? $_GET  : $_POST;

        foreach ( $fields  as  $field  )
        {
             if( ! isset($inputData[ $field ]) )
             {
                 throw   new  \core\BaseException('缺少必要参数:'.$field);
             }
            $val =   $inputData [ $field ]  ;
            if (get_magic_quotes_gpc()) {
                $ret[ $field ] = $val;
            } else {
                $ret[ $field ] = stripslashes($val);
            }
        }
        return $ret;
    }

}