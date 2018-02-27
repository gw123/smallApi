<?php
namespace  core;

class   WsController extends Container {
    /***
     *@var  WsRequest;

     */
    public  $request;

    /***
     *@var  WsResponse;
     */
    public  $response;

    public  function  __construct( $request,$response  )
    {
        $this->request = $request;
        $this->response = $response;
    }

    public  function  asJson($data)
    {
        return json_encode($data);
    }



    public  function  success($data,$msg='')
    {
        $this->header( 'Content-type','application/json' );
        return json_encode(['code'=>Code::OK,'data'=>$data,'msg'=>$msg]);
    }

    public  function  fail($code = Code::SysError,$msg='')
    {
        $this->header( 'Content-type','application/json' );
        return json_encode(['code'=>$code,'msg'=>$msg]);
    }


    /**
     * @param $filePath
     * @return string
     */
    public function  render($filePath ='',$data = array() )
    {
        //设置编码

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