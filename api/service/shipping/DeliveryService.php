<?php
namespace service\shipping;

use controller\Shipping;
use core\db\Mysql;
use core\Model;
use core\App;
use service\dal\OrderModel;
use service\enums\ShipEnum;

class DeliveryService  extends Model{

    public function __construct()
    {
        parent::__construct(App::$db_ecstore);
    }

    public  $table = 'zw_orders';

    /***
     * 分配快递单号
     * @param array $orderIds
     * @param string $delivery_company
     * @return array
     */
    public function  assignDeliveryNumber(Array $orderIds , $delivery_company , $deliveryChannel    = 'EMS_15' )
    {
        $num =1;
        if(!is_array($orderIds))
        {
            $this->error = '需要一个数组';
            return array('total'=>0, 'status'=>0, 'rows'=>[] ,'msg'=>$this->error );
        }
        $num = count($orderIds);

        $deliveryChannels = ShipEnum::$DeliveryChannel;
        if( !isset( $deliveryChannels[$deliveryChannel]) )
        {
            $this->error = '渠道不存在';
            return array('total'=>0, 'status'=>0, 'rows'=>[] ,'msg'=>$this->error );
        }
        $deliveryChannelandCompany = $deliveryChannels[$deliveryChannel];

        $sql = "select delivery_number from  zw_delivery_number  where `status`=0  and delivery_company='{$delivery_company}'  limit {$num}";
        $deliveryNumbers = $this->queryColumn($sql);

        if(!$deliveryNumbers|| count($deliveryNumbers) <$num)
        {
            $this->error = '没有足够的备用发货单号';
            return array('total'=>0, 'status'=>0, 'rows'=>$deliveryNumbers ,'msg'=>$this->error );
        }
        $deliveryNumbersStr = implode("','" ,$deliveryNumbers);
        $sql = "update zw_delivery_number set status=1 where  delivery_number in ('$deliveryNumbersStr') AND  delivery_company='{$delivery_company}' ";

        if( !$this->execute($sql) )
        {
            return ['status'=>3 , 'msg'=>'更新快递单状态出错'.$this->db->getError() ];
        };

        $rows = [];
        foreach ($orderIds  as $index=>$orderId)
        {
              array_push($rows , ['order_id'=>$orderId ,'delivery_company'=>$delivery_company, 'delivery_number'=>$deliveryNumbers[$index] ] );
              if( !$this->updateOrderDelivery($orderId,$delivery_company,$deliveryNumbers[$index],$deliveryChannel) )
              {
                  return ['status'=>3 , 'msg'=>'更新订单物流状态出错'.$this->db->getError()." \n".$this->db->getLastSql() ];
              }
        }
        return array('total'=>$num, 'status'=>1, 'rows'=>$rows );
    }

    public function updateOrderDelivery($orderId , $deliveryCompany ,$deliveryNumber,$deliveryChannel)
    {
        $sql  ="update  zw_orders  set delivery_company='{$deliveryCompany}' , delivery_number='{$deliveryNumber}' ,delivery_channel='{$deliveryChannel}' where order_id=$orderId";
        return  $this->execute($sql);
    }

    /***
     * 打印拣货单信息
     * @param array $orderIds
     * @return array|bool
     */
    public function getPrintSkuData( Array $orderIds )
    {
        $orders =  self::getOrdersStatus($orderIds);
        $orderIdsStr = implode(',' ,$orderIds);
        $sql_sku     = "SELECT name, order_id,sku,name,store_id,quantity FROM zw_order_sku WHERE order_id IN($orderIdsStr)";

        $orderSkus =  $this->db->queryAll($sql_sku);
        if (!$orderSkus)
            return false;

        $ArrSku =  array();
        $sortPos = array();
        $warings = array();
        /** 遍历购买订单中的商品 */
        foreach ($orderSkus as $orderSku)
        {
            if( !isset(  $orders[ $orderSku['order_id'] ]) )
            {
                $warings[] = "没有找到sku的订单".$orderSku['order_id'];
                App::$log->waring('没有找到sku的订单！');
                continue;
            }

            $orderInfo = &$orders[ $orderSku['order_id'] ];

            if($orderInfo && $orderInfo['order_status']=='active' && $orderInfo['client_examine']=='1' && $orderInfo['financial_examine']=='1' && ($orderInfo['ship_status']=='0' || $orderInfo['ship_status']=='2' || $orderInfo['ship_status']=='6') && $orderInfo['reship_status']=='0')
            {
                $orderInfo['isOk'] = true;
            }else{
                $warings[] = "订单不符合出库条件:".$orderSku['order_id'];
                // 不符合出库条件
                continue;
            }

            $No     = $orderSku['order_id'];
            $skuId = $orderSku['sku'];
            $quantity = intval($orderSku['quantity']);

            // 叠加商品  订单列表 和数量 和 库位名称 和商品编码
            if(isset($ArrSku[$skuId]))
            {
                $ArrSku[$skuId]['order_list'][] = $No.'='.$quantity;
                $ArrSku[$skuId]['quantity'] += $quantity;
            }else{

                $sql = sprintf('SELECT sku,barcode, pos_name FROM zw_product_pos WHERE sku = "%s" AND house_code = 1 ORDER BY add_time DESC', $skuId);
                $posInfo = $this->queryOne( $sql);

                if(!$posInfo)
                {
                    $posInfo['barcode'] = '';
                    $posInfo['pos_name'] ='';
                }

                $ArrSku[$skuId] = $posInfo;
                $ArrSku[$skuId]['name'] = $orderSku['name'];
                $ArrSku[$skuId]['order_list'][] = $No.'='.$quantity;
                $ArrSku[$skuId]['quantity']=$quantity;
                $sortPos[$skuId]  = $posInfo['pos_name']; //排序列
            }

        }

        //置订单状态为配货中
        $updateOrders = [];
        foreach ($orders as $order)
        {
            if( isset($order['isOk']) && $order['isOk'] )
                $updateOrders []= $order['order_id'];
        }
        $this->updateShipStatus($updateOrders,2);

        //根据库位排序
        array_multisort($sortPos, SORT_ASC, $ArrSku);

        $rows = array();
        $total = 0;
        foreach($ArrSku as $row)
        {
            $row['order_list'] = implode(',',$row['order_list']);
            $rows[] = $row;
            $total++;
        }
        return array('total'=>$total, 'rows'=>$rows ,'warings'=>$warings);

    }

    /**
     * 要打印的发货单数据
     *@param array $orderIds
     *@return array
     */
    public   function getPrintInvoiceData(Array $orders)
    {
        $orderIDs = [];
        foreach ($orders as $key=>$order)
        {
            if(preg_match('/\d+/',$order))
             $orderIDs[] = $order;
        }
        if(empty($orderIDs))
            return array('total'=>0, 'status'=>0, 'rows'=>array());
        $ordersSql = "select * from zw_orders where order_id in (".implode(',' , $orderIDs).")";
        $orders = $this->queryAll($ordersSql);
        $pickingTime = time();
        $orderTotal = 0;

        $orderList = array();

        foreach ( $orders as $orderInfo)
        {
            $orderId = $orderInfo['order_id'];
            if($orderInfo && $orderInfo['client_examine']=='1' && $orderInfo['financial_examine']=='1' && $orderInfo['order_status']=='active' && ($orderInfo['ship_status']=='0' || $orderInfo['ship_status']=='2' || $orderInfo['ship_status']=='6') && $orderInfo['reship_status']=='0')
            {
                $orderInfo['goods_total'] = 0;
                if (in_array($orderInfo['order_channel'], array('pinganyisheng2', 'pinganyisheng', 'cmbchina', 'liandu', 'xinyang', 'jiujiuwuxian', 'xiechengwang', 'lingqu', 'yuefuxiang', 'pinzhi365', 'guanaitong', '111', 'zonghengyingshi', 'hengtiancaifu', 'wulai66', 'hezuoqianbao', 'binke', 'yunzhonghe', 'gegejia'))) {
                    $orderInfo['hide_price'] = 1;
                } else {
                    $orderInfo['hide_price'] = 0;
                }

                $orderInfo['goods_list'] = array();
                $goods = $this->queryAll("SELECT goods_id,product_sku,name,store_id,price,quantity,amount FROM zw_order_goods WHERE order_id='$orderId'");
                if($goods)
                {
                    foreach($goods as $key=>$val)
                    {
                        $skuRows = explode('|', $val['product_sku']);
                        $skuList = array();
                        foreach($skuRows as $row)
                        {
                            $tmp = explode(':', $row);
                            $sku = isset($tmp[0]) ? trim($tmp[0]) : '';
                            $num = isset($tmp[1]) ? intval($tmp[1]) : 1;
                            $num = ($num <= 0) ? 1 : $num;
                            $posInfo = $this->queryOne("SELECT sku,name AS product_name,barcode,pos_name FROM zw_products WHERE sku='$sku'");
                            if($posInfo)
                            {
                                $posInfo['product_num'] = $val['quantity'] * $num;
                                $skuList[] = $posInfo;
                                $skuList[] = $posInfo;
                                $skuList[] = $posInfo;
                                $orderInfo['goods_total'] += $val['quantity'];
                            }
                            else
                            {
                                $skuList[] = array();
                            }
                        }
                        $goods[$key]['sku_list'] = $skuList;
                        $goods[$key]['sku_total'] = count($skuList);
                    }
                    $orderInfo['goods_list'] = $goods;
                }
                else
                {
                    $log = "PrintInvoiceData:order {$orderId} goods is empty";
                    App::$log->waring($log, 'dal');
                }
                $this->execute("UPDATE zw_orders set ship_status='2',print_status_3=print_status_3+1,picking_time='$pickingTime',update_time='$pickingTime' WHERE order_id='$orderId'");
                $orderList[] = $orderInfo;
                $orderTotal++;
            }
        }

        if($orderTotal)
        {
            return array('total'=>$orderTotal, 'status'=>1, 'rows'=>$orderList);
        }
        else
        {
            return array('total'=>0, 'status'=>0, 'rows'=>array());
        }
    }

    /**
     * 要打印的物流单数据
     *@param array $orderIds
     *@return array
     */
    public function getPrintDeliveryData(Array $orders, $opUser = '')
    {
        $succ = 0;
        $arrOrders = array();
        $waringOrders = array();
        foreach($orders as $orderId)
        {
            $orderInfo = $this->queryOne("SELECT  *  FROM zw_orders WHERE order_id='$orderId'");
            if($orderInfo && $orderInfo['order_status']=='active' && $orderInfo['client_examine']=='1' && $orderInfo['financial_examine']=='1' && ($orderInfo['ship_status']=='0' || $orderInfo['ship_status']=='2' || $orderInfo['ship_status']=='6') && $orderInfo['reship_status']=='0')
            {
                $arrOrders[] = $orderInfo;
                $succ++;
            } else
            {
                $waringOrders[] = $orderInfo;
                //不符合打单条件
                $log = "PrintDeliveryData:{$orderId} deficiencies";
                App::$log->waring($log, 'dal');
            }
        }
        $orderTotal = count($arrOrders);
        return array('total'=>$orderTotal, 'status'=>1, 'rows'=>$arrOrders ,'errorOrders'=>$waringOrders);
    }


    /**
     * 扫描验货确认
     *@param int $orderId
     *@param string $deliveryNumber
     *@param string $status 1=扫描通过；2=重新配货
     *@return int $error 0 成功，1 参数错误，2 订单无效，3 物流单号错误, 4 写库失败
     */
    public function scanConfirm($orderId, $deliveryNumber, $status, $remarks, $opUname)
    {
        $orderId = floatval($orderId);
        if($orderId <= 0 || empty($deliveryNumber))
        {
            return 1;
        }
        $deliveryNumber = trim($deliveryNumber);
        $status = intval($status);
        $nowTime = time();
        $remarks = $this->db->realEscapeString($remarks);

        $sql = "SELECT order_status,create_time,member_id,member_name,receive_name,delivery_company,delivery_number,ship_status FROM zw_orders WHERE order_id='$orderId' LIMIT 1";
        $order = $this->db->queryFirstRow($sql);
        if(empty($order) || $order['order_status'] != 'active')
        {
            return 2;
        }elseif($order['ship_status'] == '3')
        {
            return 5;//已发货状态
        }

        if(trim($order['delivery_number']) == $deliveryNumber)
        {
            $sqlArr = array();
            if($status == 1) {
                $sqlArr[] = "UPDATE zw_orders SET ship_status='6',update_time='$nowTime' WHERE order_id='$orderId'";
            }
            $receiveName = $this->db->realEscapeString($order['receive_name']);
            $sqlArr[] = "INSERT INTO zw_delivery_examine_log SET order_id='$orderId',order_time='{$order['create_time']}',scan_time='$nowTime',status='$status',delivery_company='{$order['delivery_company']}',delivery_number='$deliveryNumber',member_id='{$order['member_id']}',member_name='{$order['member_name']}',consignee='$receiveName',op_uname='$opUname',remarks='$remarks'";
            $ret = $this->db->doTransaction($sqlArr);
            if($ret)
            {
                return 0;
            }
            else
            {
                return 4;
            }
        }
        else
        {
            return 3;
        }
    }

    /**
     * 扫描发货
     *@param string $deliveryNumber
     *@param array $packager 打包员
     *@param string $opUser 操作人
     *@return array errorno =0 成功，=1参数错误或订单不存在，2=未扫描验货，3=重复发货，4=已退货，5=系统错误
     */
    public function shippingConfirm($deliveryNumber, $packager, $opUser = '')
    {
        if(empty($deliveryNumber))
        {
            return array('errorno'=>1, 'log'=>'');
        }

        $sql = "SELECT * FROM zw_orders WHERE delivery_number='$deliveryNumber' AND order_status='active' LIMIT 1";
        $orderInfo = $this->db->queryFirstRow($sql);
        if(empty($orderInfo))
        {
            return array('errorno'=>1, 'log'=>'');
        }

        if($orderInfo['delivery_channel'] == 'JdCOD')
        {
            return array('errorno'=>5, 'log'=>'京东货到付款订单，请使用新版发货系统');
        }
        //获取锁 ,获取成功后刷新订单信息
        //参照 Lib/Storage/Delivery.class.php::deliveryConfirm
        $deliveryObj = Dal_Factory::getInstance('Dal_Storage_Delivery');
        $lock = $deliveryObj->getLock($orderInfo['order_id']);
        if (!$lock)
        {
            return array('errorno'=>11, 'log'=>'获取并发控制锁失败');
        }
        //刷新订单信息
        $orderInfo = $this->db->queryFirstRow($sql);

        $return = array();
        if($orderInfo['ship_status'] == '6' && ($orderInfo['pay_status'] == '1' || $orderInfo['pay_status'] == '2') && $orderInfo['reship_status'] == '0')
        {
            $ret = $this->submitShipping($orderInfo, $packager, $opUser);
            if($ret['status'])
            {
                $delivery = array('company'=>$orderInfo['delivery_company'], 'number'=>$orderInfo['delivery_number']);
                $return =  array('errorno'=>0, 'log'=>$ret['log'], 'oid'=>$orderInfo['order_id'], 'delivery'=>$delivery);
            }
            else
            {
                $return = array('errorno'=>5, 'log'=>$ret['log']);
            }
        }
        elseif($orderInfo['ship_status'] == '2')
        {
            $return = array('errorno'=>2, 'log'=>'');
        }
        elseif($orderInfo['ship_status'] == '3' || $orderInfo['ship_status'] == '4' || $orderInfo['ship_status'] == '5')
        {
            $return = array('errorno'=>3, 'log'=>'');
        }
        elseif($orderInfo['reship_status'] != '0')
        {
            $return = array('errorno'=>4, 'log'=>'');
        }
        elseif($orderInfo['client_examine'] == '0' || $orderInfo['financial_examine'] == '0')
        {
            $return = array('errorno'=>5, 'log'=>'');
        }
        else
        {
            $return = array('errorno'=>5, 'log'=>'');
        }
        //释放锁
        $deliveryObj->releaseLock($orderInfo['order_id']);
        return $return ;
    }

    /**
     * 提交发货
     *@param array $orderIds 订单id
     *@param array $packager 打包员
     *@param string $opUser 操作人
     *@return array
     */
    public function submitShipping($orderInfo, $packager, $opUser)
    {
        $orderId = floatval($orderInfo['order_id']);
        $shipTime = time();

        //写发货单主表
        $memberName = $this->db->realEscapeString($orderInfo['member_name']);
        $receiveName = $this->db->realEscapeString($orderInfo['receive_name']);
        $receiveAddr = $this->db->realEscapeString($orderInfo['receive_addr']);
        $sql = "INSERT INTO zw_delivery SET order_id='$orderId',member_id='{$orderInfo['member_id']}',member_name='$memberName',total_amount='{$orderInfo['total_amount']}',freight='{$orderInfo['freight']}',pay_way='{$orderInfo['pay_way']}',
		delivery_channel='{$orderInfo['delivery_channel']}',delivery_city='{$orderInfo['receive_city']}',delivery_company='{$orderInfo['delivery_company']}',delivery_number='{$orderInfo['delivery_number']}',
		ship_name='$receiveName',ship_addr='$receiveAddr',ship_zip='{$orderInfo['receive_zip']}',ship_tel='{$orderInfo['receive_tel']}',ship_mobile_64='{$orderInfo['receive_mobile_64']}',create_time='$shipTime',
		op_name='$opUser',packager='$packager',status='ready',order_refer='{$orderInfo['order_refer']}',order_channel='{$orderInfo['order_channel']}'";
        if($this->db->doQuery($sql))
        {
            $deliveryId = $this->db->getLastInsertID();
        }
        else
        {
            $deliveryId = 0;
        }

        $result = array();
        if(!$deliveryId)
        {
            $result[] = array('msg'=>'发货主记录写入失败。');
            return array('status'=>false, 'log'=>$result);
        }

        $arrSql = array();
        $skuList = array();

        $goodsList = $this->db->queryAllRows("SELECT * FROM zw_order_goods WHERE order_id=$orderId");
        if($goodsList)
        {
            foreach($goodsList as $val)
            {
                $quantity = intval($val['quantity']);
                $val['name'] = $this->db->realEscapeString($val['name']);
                $arrSql[] = "INSERT INTO zw_delivery_goods SET delivery_id='$deliveryId',order_id='$orderId',item_type='goods',goods_id='{$val['goods_id']}',goods_name='{$val['name']}',product_sku='{$val['product_sku']}',store_id='{$val['store_id']}',quantity='$quantity',out_time='$shipTime'";
                $skuRows = explode('|', trim($val['product_sku']));
                foreach($skuRows as $skuRow)
                {
                    $arrItem = explode(':', $skuRow);
                    $sku = isset($arrItem[0]) ? $arrItem[0] : '';
                    if(empty($sku)) continue;
                    $num = isset($arrItem[1]) ? intval($arrItem[1]) : 1;
                    $num = max($num,1);
                    if(isset($skuList[$sku]))
                    {
                        $skuList[$sku]['quantity'] += $quantity * $num;
                    }
                    else
                    {
                        $subQuantity = $quantity * $num;
                        $skuList[$sku] = array('store_id'=>$val['store_id'],'quantity'=>$subQuantity);
                    }
                }
            }
        }

        $skuTotal = count($skuList);
        $skuIsEnoughNum = 0;
        //货品按照采购时间先进先出
        foreach($skuList as $sku=>$val)
        {
            $storeId = $val['store_id'];
            $quantity = $val['quantity'];
            $product = $this->db->queryFirstRow("SELECT * FROM zw_product_stock WHERE sku='$sku' AND house_code='$storeId'");
            if(empty($product))
            {
                $result[] = array('msg'=> 'sku:'.$sku .' 在分仓中不存在');
                break;
            }
            if($product['real_stock'] < $quantity)
            {
                $result[] = array('msg'=> 'sku:'.$sku .' 货品库存不足');
                break;
            }

            $needQuantity = $quantity;
            $arrInventory = $this->db->queryAllRows("SELECT ip_id,inventory_id,buyer_id,unit_price,tax_price,advert_price,quantity,out_quantity FROM zw_inventory_products WHERE sku='$sku' AND house_code='{$storeId}' AND quantity>out_quantity ORDER BY addtime ASC");//加上仓库ID
            $countInventorySum = 0;//所有入库单剩余总数
            if (!empty($arrInventory))
            {
                foreach ($arrInventory as $countInventory)
                {
                    $countInventorySum += intval($countInventory['quantity']) - max(0,intval($countInventory['out_quantity']));
                }
            }
            //入库单为空或者总数小于发货数量
            if(empty($arrInventory) || $countInventorySum < $needQuantity)
            {
                //认为入库单总的入库数量减去总的出库数量与流通库存的剩余库存是一致的
                //当查询对应仓库的入库单为空时，不加仓库id查询
                $arrInventory = $this->db->queryAllRows("SELECT ip_id,inventory_id,buyer_id,unit_price,tax_price,advert_price,quantity,out_quantity FROM zw_inventory_products WHERE sku='$sku'  AND quantity>out_quantity ORDER BY addtime ASC");
                Dapper_Log::trace(sprintf("订单%s货品SKU%s仓库ID%d无入库记录",$orderId,$sku,$storeId),'dal');
                if (empty($arrInventory))
                {
                    $result[] = array('msg'=> 'sku:'.$sku .' 采购入库库存为空');
                    break;
                }
            }

            foreach($arrInventory as $row)
            {
                if($needQuantity <= 0) break;
                $leftQuantity = intval($row['quantity']) - max(0, intval($row['out_quantity']));
                if($leftQuantity <= 0) continue;
                if($leftQuantity >= $needQuantity)
                {
                    $arrSql[] = "UPDATE zw_inventory_products SET out_quantity=out_quantity+$needQuantity WHERE ip_id='{$row['ip_id']}'";
                    $arrSql[] = "INSERT INTO zw_delivery_sku SET sku='$sku',order_id='$orderId',inventory_id='{$row['inventory_id']}',store_id='$storeId',buyer_id='{$row['buyer_id']}',cost_price='{$row['unit_price']}',tax_price='{$row['tax_price']}',advert_price='{$row['advert_price']}',out_quantity='$needQuantity',out_time='$shipTime'";
                    $needQuantity = 0;
                }
                else
                {
                    $arrSql[] = "UPDATE zw_inventory_products SET out_quantity=out_quantity+$leftQuantity WHERE ip_id='{$row['ip_id']}'";
                    $arrSql[] = "INSERT INTO zw_delivery_sku SET sku='$sku',order_id='$orderId',inventory_id='{$row['inventory_id']}',store_id='$storeId',buyer_id='{$row['buyer_id']}',cost_price='{$row['unit_price']}',tax_price='{$row['tax_price']}',advert_price='{$row['advert_price']}',out_quantity='$leftQuantity',out_time='$shipTime'";
                    $needQuantity -= $leftQuantity;
                }
            }

            if($needQuantity == 0)
            {
                //全部出完，库存足够
                $skuIsEnoughNum++;
                $arrSql[] = "UPDATE zw_product_stock SET real_stock=real_stock-$quantity,real_freezing_stock=real_freezing_stock-$quantity,freezing_stock=freezing_stock-$quantity WHERE sku='$sku' AND house_code='$storeId'";
                $arrSql[] = "UPDATE zw_products SET real_stock=real_stock-$quantity WHERE sku='$sku'";
                //库存日志
                $resultStock = $product['real_stock'] - $quantity;
                $productName = $this->db->realEscapeString($product['product_name']);
                $arrSql[] = "INSERT INTO zw_storage_log SET house_code='$storeId',product_name='$productName',sku='$sku',barcode='{$product['barcode']}',pos_name='',op_type='out',op_action='4',pre_stock='{$product['real_stock']}',op_stock='$quantity',result_stock='$resultStock',item_id='$orderId',op_user='$opUser',op_time='$shipTime'";
            }
            else
            {
                $result[] = array('msg'=> 'sku:'.$sku .' 采购入库库存不足');
            }
        }

        if($skuTotal > 0 && $skuTotal == $skuIsEnoughNum)
        {
            //更新订单状态
            $arrSql[] = "UPDATE zw_orders SET ship_status='3',ship_time='$shipTime',update_time='$shipTime' WHERE order_id='$orderId'";
            $arrSql[] = "UPDATE zw_delivery SET status='succ' WHERE delivery_id='$deliveryId'";
            if($orderInfo['wholesale'] == 0) {
                //zhiwo自销
                $arrSql[] = "INSERT INTO zw_sms_queue SET send_type='shipping',member_id='{$orderInfo['member_id']}',member_mobile_64='{$orderInfo['receive_mobile_64']}',order_id='$orderId',order_refer='{$orderInfo['order_refer']}',order_channel='{$orderInfo['order_channel']}',total_amount='{$orderInfo['total_amount']}',pay_way='{$orderInfo['pay_way']}',delivery_company='{$orderInfo['delivery_company']}',delivery_number='{$orderInfo['delivery_number']}',receipt_name='$receiveName',add_time='$shipTime',send_status='0'";
            }
            if(in_array($orderInfo['order_refer'], array('cps','cps_wap','cps_app'))) {
                //cps推送
                $arrSql[] = "UPDATE zw_order_cps SET order_status=11 WHERE order_id='$orderId'";
            }

            $ret = $this->db->doTransaction($arrSql);
            if($ret)
            {
                $result[] = array('msg'=>'发货成功。物流公司：'.$orderInfo['delivery_company'].'，物流单号：'.$orderInfo['delivery_number']);
                return array('status'=>true, 'log'=>$result);
            }
            else
            {
                $this->db->doQuery("UPDATE zw_delivery SET status='failed' WHERE delivery_id='$deliveryId'");
                $result[] = array('msg'=>'发货记录写入数据表失败。');
            }
        }
        else
        {
            $this->db->doQuery("UPDATE zw_delivery SET status='failed' WHERE delivery_id='$deliveryId'");
            $result[] = array('msg'=>'库存为空。');
        }

        return array('status'=>false, 'log'=>$result);
    }

    /**
     * 修改订单物流公司
     *@param int $orderId
     *@param string $deliveryCompany
     *@param string $deliveryNumber
     *@param string $opUser
     *@return bool
     */
    public function updateDelivery($orderId, $deliveryCompany, $deliveryNumber, $opUser)
    {
        $orderId = floatval($orderId);
        if($orderId <= 0)
        {
            return false;
        }

        $sql = "SELECT ship_status FROM zw_orders WHERE order_id='$orderId'";
        $ret = $this->db->queryFirstRow($sql);
        if(!$ret)
        {
            return false;
        }

        if($ret['ship_status'] == '0' || $ret['ship_status'] == '1' || $ret['ship_status'] == '2' || $ret['ship_status'] == '3' || $ret['ship_status'] == '6')
        {
            switch($deliveryCompany)
            {
                case '圆通速递': $deliveryChannel = 'Express_5'; break;
                case '申通快递': $deliveryChannel = 'Express_5'; break;
                case '中通速递': $deliveryChannel = 'Express_5'; break;
                case '宅急送_已付': $deliveryChannel = 'Express_5'; break;
                case 'EMS邮政速递': $deliveryChannel = 'EMS_15'; break;
                case '宅急送': $deliveryChannel = 'COD'; break;
                case '微特派': $deliveryChannel = 'COD'; break;
                case '圆通货到付款': $deliveryChannel = 'COD'; break;
                case '百世快运': $deliveryChannel = 'Express_5'; break;
                case '安能物流': $deliveryChannel = 'Express_5'; break;
                default : $deliveryChannel = '';
            }

            $opTime = time();
            $logText = '修改物流公司为：'.$deliveryCompany.',修改物流单号为：'.$deliveryNumber;

            $sqlArr[] = "UPDATE zw_orders SET delivery_channel='$deliveryChannel',delivery_company='$deliveryCompany',delivery_number='$deliveryNumber',update_time='$opTime' WHERE order_id='$orderId'";
            $sqlArr[] = "INSERT INTO zw_order_log SET rel_id='$orderId',op_name='$opUser',op_time='$opTime',bill_type='order',behavior='updates',result='succ',log_text='$logText'";
            $ret = $this->db->doTransaction($sqlArr);
            return $ret;
        }
        else
        {
            return false;
        }
    }



}