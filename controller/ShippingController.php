<?php
namespace  controller;
use core\App;
use  core\Controller;
use lib\AES;
use service\dal\OrderModel;
use service\enums\ShipEnum;
use service\shipping\DeliveryService;

class ShippingController extends Controller{
    public  $info = 'hello123';
    public function indexAction()
    {
        return $this->render('index');
    }
    /**
     * 打印出库单
     * @return string
     */
    public function printskuAction()
    {
        $orderNos =  $_GET['orderNo'];
        if(!is_array($orderNos))
            return $this->asJson(['status'=>2 , 'msg'=>'参数不正确']);
        $orderIds = [];
        foreach ($orderNos as $orderNo => $index)
        {
            $orderIds[] = $orderNo;
        }

        $orderModel = new OrderModel();

        $data = $orderModel->getPrintSkuData($orderIds);

        return $this->asJson($data);
    }

    /***
     *  获取打印 发货单的 详细信息
     */
    public function getPrintInvoiceDataAction()
    {
        $orderNos =  $_GET['orderNo'];
        if(!is_array($orderNos))
            return $this->asJson(['status'=>2 , 'msg'=>'参数不正确']);
        $orderIds = [];
        foreach ($orderNos as $orderNo => $index)
        {
            $orderIds[] = $orderNo;
        }

        $deliveryService = new DeliveryService();

        $data = $deliveryService->getPrintInvoiceData($orderIds);

        return $this->asJson($data);
    }
    /**
     * 打印物流单数据
     */
    public function printDeliveryAction()
    {
        $orderIds =  $this->getInput('deliveryOrderIds');
        $shipObj = new  OrderModel();
        $ret = $shipObj->getPrintDeliveryData($orderIds);
        if($ret == false)
        {
            $data = array('status'=>2,'total'=>0);
        }else{
            $aesObj = new AES();
            foreach($ret['rows'] as $k=>$v)
            {
                if(!empty($v['receive_mobile_64']))
                {
                    $ret['rows'][$k]['receive_mobile'] = $aesObj->decrypt($v['receive_mobile_64'], 'z2357w11131719');
                }
            }
            $data = array('status'=>1,'total'=>$ret['total'],'rows'=>$ret['rows'] ,'errorOrders'=>$ret['errorOrders']);
        }

       return  $this->asJson($data);
    }

    /***
     * 添加物流单号
     * @return string
     */
    public function addDeliveryNumberAction()
    {
        $fields = ['deliveryCompany' , 'deliveryNumberPre' ,'number_left' ,'number_right'];
        $formData = $this->getInput($fields);
        $deliveryCompany  = $formData['deliveryCompany'];
        $deliveryNumberPre = $formData['deliveryNumberPre'];
        $number_left = intval( $formData['number_left'] );
        $number_right= intval($formData['number_right']);
        $time = time();

        $deliveryCompanys = ShipEnum::$DeliveryCompany;
        if( !in_array($deliveryCompany  ,$deliveryCompanys))
        {
            return $this->asJson( ['status'=>2 , 'msg'=>'未知的物流公司'] );
        }
        if(!($number_left&&$number_right&&$number_right-$number_left>0))
        {
            return $this->asJson(['status'=>2,'msg'=>'号码设置有问题']);
        }

        for ($i = $number_left ;$i<$number_right ;$i++)
        {
            $deliveryNumber  = $deliveryNumberPre.$i;
            $data = ['delivery_company'=>$deliveryCompany,
                  'delivery_number'=>$deliveryNumber,'status'=>0,
                 'create_time'=>$time];

            if(!App::$db_ecstore->insert($data ,'zw_delivery_number') )
            {
                $error=  App::$db_ecstore->getError();
                return $this->asJson( ['status'=>3 , 'msg'=>$error ] );
            }
        }

        return $this->asJson(['status'=>1]);
    }

    /***
     * 分配物流单号
     * @return string
     */
    public function assignDeliveryNumberAction()
    {
        $orderIds =  $this->getInput('deliveryOrderIds');
        $deliveryCompany = $this->getInput('deliveryCompany');

        $deliveryCompanys = ShipEnum::$DeliveryCompany;

        if( !in_array($deliveryCompany  ,$deliveryCompanys))
        {
            return $this->asJson( ['status'=>2 , 'msg'=>'未知的物流公司'] );
        }

        $deliveryService  = new DeliveryService();

        $deliveryOrders = $deliveryService->assignDeliveryNumber( $orderIds ,  $deliveryCompany );

        return $this->asJson($deliveryOrders);

    }

    /***
     * 检测物流单
     */
    public function examineDeliveryGoodsAction(){
        $orderNos = $this->getInput('orderNo');
        if(!is_array($orderNos)&&empty($orderNos))
            return  $this->error( '参数不合法');

        $deliveryService = new DeliveryService();
        $orderInfos =  $deliveryService->getPrintInvoiceData($orderNos);
        //var_dump($orderInfos); exit();
        $orders = $orderInfos['rows'];
        return $this->render('', ['orders'=>$orders] );
    }
}