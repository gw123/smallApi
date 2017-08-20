<?php
 namespace controller;
 use core\Session;
use core\Controller;
 use lib\TreeUtils;
 use  service\dal\UserModel;
 use service\sys\RoleService;

 class AdminController extends BackendController{

     public function  indexAction()
     {

         //return $this->render('' ,$list);
     }

     public  function  roleAction()
     {
         $roleService = new RoleService();
         $list = $roleService->lists();

         return $this->render('' ,$list);
     }
     //
     public function   actionsAction()
     {
         $roleService = new RoleService();
         if($this->isPost())
         {
             $fields = ['id','scopes_name','scopes_value' ,'parent_id' ,'parent_name','grade'];
             $formdata = $this->getInput($fields ,'POST');
             if(empty($formdata['id']))
             {
                 $data = $formdata;
                 if($data['parent_id'])
                 {
                     $data['grade'] =2;
                 }else{
                     $data['grade'] =1;
                 }
                 $ret =  $roleService->addAction($data);
             }else{
                 $data['id'] = $formdata['id'];
                 $data['scopes_name'] = $formdata['scopes_name'];
                 $data['scopes_value'] = $formdata['scopes_value'];
                 $ret = $roleService->updateAction($data);
             }
             $actionTree = $roleService->getActionTree();
             if($ret)
             {
                 //$msg = $roleService->db->getLastSql();
                 return $this->render('' , [ 'tree'=>$actionTree ,'msg'=>'']);
             }else{
                 $msg = $roleService->db->getError();
                 return $this->render('' , [ 'tree'=>$actionTree ,'msg'=>$msg]);
             }
         }

         $actionTree = $roleService->getActionTree();
         return $this->render('' , [ 'tree'=>$actionTree ,'msg'=>'']);
     }

     public function   adminListAction()
     {
         $userModel = new  UserModel();
         $result = $userModel->lists(['id','email','nickname'] ,'' ,2,10);
         var_dump($result);
     }

     public function assignUserRoleAction()
     {

     }

     public function assignRoleActionAction(){

     }

 }