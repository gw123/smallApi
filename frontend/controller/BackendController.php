<?php
namespace frontend\controller;
use core\Session;
use core\Controller;
use  service\dal\UserModel;
class BackendController extends Controller{

   public function __construct()
   {
         $user = Session::get('user');

         if(!$user)
         {
             echo  $this->redirect('site/login');exit();
         }

   }

    /***
     *  添加user   方便布局
     * @param string $filePath
     * @param array $data
     * @return string
     */
   public function render($filePath = '', $data = array())
   {
       $user = Session::get('user');
       $data['user'] = $user;
       return parent::render($filePath, $data); // TODO: Change the autogenerated stub
   }

}