<?php
namespace core;
use \All;
/**
*  兼容层 隔离不同的请求
 */
class  WsRequest
{
    public $request;
    public $redis;
    public $db;

    public $_get;
    public $_post;
    public $_header;

    public $_query_string;
    public $_path_info;
    public $_method;

    public $_controller;
    public $_action;

    public function __construct(&$server)
    {
        $this->request = $server;
        $this->parseRequest($request);
    }

    public function  parseRequest(&$request)
    {

    }
}

