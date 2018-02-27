<?php
namespace  core;

use core\base\BaseController;

class   WsController extends BaseController {
    /***
     *@var  WsRequest;

     */
    public  $request;

    /***
     *@var  WsCookie;
     */
    public  $cookie;

    /***
     *@var  WsSession;
     */
    public  $session;

    /***
     *@var  WsResponse;
     */
    public  $response;

    public  function  __construct( $request,$response,$session,$cookie  )
    {
        parent::__construct($request,$response,$session,$cookie);
    }

    public  function  asJson($data)
    {
        return json_encode($data);
    }


    public function error($msg ,$timeout=2 ,$status = 0 ,$viewTpl = "/site/error")
    {

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