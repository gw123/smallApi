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
    ALL::dispatchWs($frame,$server);
});

$server->on('close', function($server, $fd) {
    echo "connection close: {$fd}\n";
});

$server->start();


