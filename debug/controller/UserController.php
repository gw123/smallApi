<?php
namespace api\controller;
use core\Controller;
use  service\dal\UserModel;
 class UserController extends Controller{


     public function listAction()
     {
        $userModel = new  UserModel();

         $result = $userModel->lists(['id','email','nickname'] ,'' ,2,10);


          var_dump($result);
     }
 }