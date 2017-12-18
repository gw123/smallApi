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
    public $cookieData;
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

    public function setCookie($cookieData)
    {
        $this->cookieData = $cookieData;
    }

    /***
     * @param $msg_body
     * @param string $type 数据类型
     * @internal param 输出数据类型 $body
     */
    public function output($msg_body ,$type='')
    {
        if($type) {
            $data['type'] = $type;
        } else{
            $data['type'] = 'msg';
        }
        $data['status'] = $this->status;
        if(!empty($this->cookieData)) {
            $data['cookie'] = $this->cookieData;
        }
        $data['data'] = $msg_body;
        $data = json_encode($data);
        $this->server->push($this->client_fd, $data);
    }
}