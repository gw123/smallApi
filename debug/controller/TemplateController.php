<?php
namespace api\controller;
use api\service\ChartService;
use core\Controller;
use  service\dal\UserModel;
 class TemplateController extends Controller{

     public function indexAction()
     {
         $data = [];
         return $this->render('index', ['data' => $data]);
     }

     public function  createAction()
     {
         $data = $this->request->_post;
         $responseData = [];
         $data['user_id'] = 1;
         if($chartModel = ChartService::createTemplate($data)){
             $responseData['status'] = 1;
             $responseData['data']['id'] = $chartModel->id;
             $responseData['msg'] = '创建成功';
         }else{
             $responseData['status'] = 2;
             $responseData['msg'] = '创建失败';
         }

         return  $this->asJson($responseData);
     }

     public function  updateTemplate()
     {
         $data = $this->request->_post;
         $responseData = [];
         $data['user_id'] = 1;
         if( ($chartModel = ChartService::updateTemplate($data)) ){
             $responseData['status'] = 1;
             $responseData['msg'] = '创建成功';
         }else{
             $responseData['status'] = 1;
             $responseData['msg'] = '创建成功';
         }

         return  $this->asJson($responseData);

     }


 }