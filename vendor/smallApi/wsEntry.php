<?php
class Client{
    //
    public  $fd ;
    public  $token;
    public  $user;
    public function __construct($fd)
    {
        $this->fd = $fd;
    }

    public function setToken($token)
    {
        $this->token = $token;
    }

    public function changeToken($token)
    {
        $this->token = $token;
    }
}

class User{
    public $username;
    public $auth_token;
    public $base_info;
}

$client_user_list = [];
$client_fd_list = [];

# Websocket 服务
$server = new swoole_websocket_server("0.0.0.0", 4000);
$server->on('open', function($server, $req) use($client_user_list) {
    echo "connection open: {$req->fd}\n";
    $client_user_list[$req->fd] = [];
});

$server->on('message', function($server, $frame) {
    echo "received message: {$frame->data}\n";
    $pathinfo= $frame->data->path_info;
    $map = \core\Router::parseRouter($pathinfo);
    $response = parseFrame($frame->data);
    $server->push($frame->fd, json_encode($response));
});

$server->on('close', function($server, $fd) {
    echo "connection close: {$fd}\n";
});

$server->start();


function parseFrame($frame)
{
    switch($frame->path_info){
        case 'path_info' :
           $response =  parseTokenFrame($frame);
            break;
        case 'msg' :
           $response =  parseMsgFrame($frame);
           break;
    }
    return $response;
}

function parseTokenFrame($frame)
{

}

function parseMsgFrame($frame)
{

}