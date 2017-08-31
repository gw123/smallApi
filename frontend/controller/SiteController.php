<?php
namespace frontend\controller;
use core\Controller;
use core\Session;
use  service\dal\UserModel;
use service\sys\SiteService;

class SiteController extends Controller{

     public function loginAction()
     {
         if($this->isPost())
         {
             $post =  $this->getInput(['username' , 'password'] ,'POS');
             //var_dump($post);T
             $SiteService = new SiteService();
             $user =$SiteService->login($post['username'] ,$post['password']);
             if( !$user )
             {
                 return $this->render('',['error'=>$SiteService->error] );
             }else{
                  Session::set('user' , $user);

                  return $this->redirect('/admin/index');
             }
         }

        return $this->render( );
     }
 }