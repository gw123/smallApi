<?php
namespace  core\base;
use core\Container;

class   BaseController extends Container {
    /***
     *@var  BaseRequest;
     */
    public  $request;

    /***
     *@var  BaseCookie;
     */
    public  $cookie;

    /***
     *@var  BaseSession;
     */
    public  $session;

    /***
     *@var  BaseResponse;
     */
    public  $response;

    public  function  __construct( $request,$response,$session,$cookie  )
    {
        $this->request = $request;
        $this->response = $response;
        $this->cookie = $cookie;
        $this->session = $session;
    }

    public  function  asJson($data)
    {
        return json_encode($data);
    }

    public  function  asJs($data)
    {
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
     * @return string
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
        return \All::$app->view->render($filePath,$data);
    }

}