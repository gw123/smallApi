<?php
namespace  core;
use api\model\BaseModel;
use api\service\Code;

class   Controller extends Container {


    /***
     * @var \core\Request;
     */
    public  $request;
<<<<<<< HEAD:core/Controller.php
    public  $user = null;
    public  $response = '';
    public  function  __construct( $request ,$response )
    {
        $this->request = $request;
        $this->response = $response;
        $user_session = $this->request->getSession('user');
        $user_session = json_decode($user_session,true);
        $this->user = $user_session;
    }


=======

    public  function  __construct( $request  )
    {
        $this->request = $request;
    }


    protected function  checkPostData()
    {
        if($this->isPost())
        {

        }
    }

>>>>>>> d5a813913fc9a8d0c3ade4d4d09edf3755f0ca52:vendor/smallApi/core/Controller.php
    public  function  asJson($data)
    {
        $this->header( 'Content-type','application/json' );
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
<<<<<<< HEAD:core/Controller.php
        $this->response->header($key,$value);
=======
        $this->request->response->header($key,$value);
>>>>>>> d5a813913fc9a8d0c3ade4d4d09edf3755f0ca52:vendor/smallApi/core/Controller.php
    }

    public  function  isAjax()
    {
        return isset($_SERVER["HTTP_X_REQUESTED_WITH"]) && strtolower($_SERVER["HTTP_X_REQUESTED_WITH"])=="xmlhttprequest";
    }

    public  function isPost(){
<<<<<<< HEAD:core/Controller.php
=======

>>>>>>> d5a813913fc9a8d0c3ade4d4d09edf3755f0ca52:vendor/smallApi/core/Controller.php
        return isset($this->request->_method) && strtolower($this->request->_method) == 'post';
    }

    public function  isGet(){
        return isset($this->request->_method) && strtolower($this->request->_method) == 'get';
    }

    public  $fields_error = [];
    /***
     * @param $rules    验证字段  默认值  是否必填  过滤函数
     *  [ 'code,id',0,0,'intval' ]
     * @return bool
     */
    public function getField($rules ,$method='get')
    {
        $this->fields_error = [];
        $model = new BaseModel();
        $model->rules();
        if(!is_array($rules)) {
            return false;
        }
        $data = [];
        if($method=='get'){
            $data = $this->request->_get;
        }else{
            $data = $this->request->_post;
        }

        $requestData = [];
        foreach ($rules as $rule){
            if(is_array($rule)){
                $fields = explode(',',$rule[0]);
                foreach ($fields as $k=> &$field){
                    $field = trim($field);
                    if($field==''){
                        unset($fields[$k]);
                    }
                }
                $default = $rule[1];
                $is_need = isset($rule[2])?$rule[2]:false;
                $filter_fun  = isset($rule[3])?$rule[3]:false;
                if($filter_fun&&!function_exists($filter_fun)){
                    echo "Controller getField: 规则过滤函数不存在".EOL;
                }
                foreach ($fields as $field){
                    if(isset($data[$field])){
                        if($filter_fun){
                            $requestData[$field] = $filter_fun($data[$field]);
                        }else{
                            $requestData[$field] = $data[$field];
                        }
                    }else{
                        if($is_need){
                            $this->fields_error[] = $field."not set";
                        }
                        if($default){
                            $requestData[$field] = $default;
                        }
                    }
                }
            }else{
                echo "Controller getField: 规则必须是数组".EOL;
            }
        }
        if(empty($this->fields_error)){
            return $requestData;
        }
        return false;
    }

    public function redirect($url)
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

    public function __call($name, $arguments)
    {
         return $this->error('请求地址不存在');
        // TODO: Implement __call() method.
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
<<<<<<< HEAD:core/Controller.php
=======
        //var_dump(All::$app->view);
>>>>>>> d5a813913fc9a8d0c3ade4d4d09edf3755f0ca52:vendor/smallApi/core/Controller.php
        return \All::$app->view->render($filePath,$data);
        //$loader = new Twig_Loader_String();
        //$twig =   new \Twig_Environment($loader);
        //echo $twig->render('Hello !', array('name' => 'Fabien'));

        //  $config = isset(App::$config['twig'])?App::$config['twig']:[];
        // $loader = new \Twig_Loader_Filesystem(ROOT_PATH.'/view');
        // $twig =   new \Twig_Environment($loader, $config);
        // return $twig->render($filePath, $data);

    }

}