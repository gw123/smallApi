<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/12/18/018
 * Time: 11:06
 */

namespace core;


use core\base\BaseResponse;

class WsResponse extends  BaseResponse
{
    public $client_fd;
    public $server;
    public $status;

    /***
     * WsResponse constructor.
     * @param $server
     * @param $client_fd
     */
    public function __construct($server ,$client_fd)
    {
        $this->client_fd = $client_fd;
        $this->server = $server;
        $this->status = 200;
    }

    /***
     * 设置返回数据的状态
     * @param $status
     */
    public function setStatus($status)
    {
        if($status) {
            $this->status = $status;
        }
    }


    /***
     * @param $msg_body
     * @param string $type 数据类型
     * @internal param 输出数据类型 $body
     */
    public function output($msg_body ,$status=0)
    {
        if(!$status){
            $status = $this->status;
        }
        \All::push($this->client_fd,$msg_body,'frame',$status);
    }
}