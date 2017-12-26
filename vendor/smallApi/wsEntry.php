<?php
$serverConfig      = require_once ( APP_PATH."/config/server.php" );
$client_user_list = [];
$client_fd_list = [];
# Websocket 服务
$server = new swoole_websocket_server($serverConfig['bind_addr'], $serverConfig['port']);
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



