<?php
namespace service\sys;

use core\db\Mysql;
use core\Model;
use core\App;
use service\dal\OrderModel;
use service\enums\ShipEnum;

class  SiteService  extends Model{

    public $table='zw_admin_user';
    public function __construct()
    {
        parent::__construct(App::$db_ecstore);
    }

    public  $error;
    /***
     * @param $username
     * @param $password
     * @return int
     */
    public  function  login($username , $password){
        $password =  md5($password);

        if(! preg_match("/[\w_]{2,30}/",$username) )
        {
            $this->error = '非法参数';
            return   false;
        }
        $sql ="select * from  zw_admin_user  where uname='$username' and  passwd='$password' ";
        //echo $sql; exit();
        $user = $this->queryOne($sql);
        if(!$user)
        {
            $this->error = '非法用户';
            return   false;
        }
        return  $user;
    }

}