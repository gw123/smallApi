<?php
namespace  controller;
use  core\Controller;
use service\dal\OrderModel;

class OrderController extends  Controller{

    public function  listAction(){

        $params1 = [ 'order_id','receive_name','receive_addr','receive_mobile' , 'member_name','goods_id','ship_status','reship_status','order_channel','delivery_channel' ,'delivery_company'];
        $params2 = ['price_left' , 'price_right'];

        $con1 =  $this->getInput($params1);
        $con2 =  $this->getInput($params2);
        if($con1['delivery_channel']=='全部渠道') $con1['delivery_channel'] = '';
        $orderModel =  new OrderModel();
        $orderModel->addFilterWhere($con1);

        $validTime = time() - 3600*24*360;
        $con3 = "update_time>$validTime AND order_status='active' AND pay_status IN('1','2') AND is_delivery='Y' AND client_examine='1' AND financial_examine='1'";
        $orderModel->addFilterWhere($con3);

        if($con2['price_left'])
         $orderModel->addFilterWhere('total_amount>'.$con2['price_left']);
        if($con2['price_right'])
         $orderModel->addFilterWhere('total_amount<'.$con2['price_right']);

        $params = [ '_search','nd' ,'rows','page','sidx','sord' ];
        $params =  $this->getInput($params);
        $res = $orderModel->lists([] ,$params['page'] ,$params['rows']);

         return $this->asJson($res);

    }

}