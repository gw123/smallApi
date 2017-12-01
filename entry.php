<?php
## 日志服务 
include('logger.php');

## 基础服务入口
$httpServerConf = [
    'port'=>82,
    'bind_addr'=>"0.0.0.0.0"
];

#监听地址 0.0.0.0 是全部地址
$http = new swoole_http_server("0.0.0.0", 82);

$http->on("start", function ($server) {
	global $httpServerConf;
    echo "Swoole http server is started at {$httpServerConf['bind_addr']}:{$httpServerConf['port']}\n";
});

/**
* E_ALL =》运行错误 
*/
set_error_handler(function($errno ,$errmsg,$errfile,$errline)
{
  echo "File : ".$errfile." => ".$errline ."\n Msg: " . $errmsg."\n";
});

/**处理语法错误*/
register_shutdown_function(function(){
	$msg = error_get_last();
	echo "语法错误；\n";
	print_r($msg);
	echo "\n swoole 调试信息 : \n";
	die();
});


$http->on("request", function ($request, $response) {
	//trigger_error("A custom error has been triggered");
	//$request = json_decode( json_encode($request ) , true);
	$requestParam['host'] = $request->header['host'];
	// $requestParam['port'] = $request['server']['port'];
	// $requestParam['cookie'] = $request['cookie'];
	// $requestParam['get'] = $request['get']; 
	// $requestParam['post'] = $request['post'];
	// $requestParam['query_string'] = $request['server']['query_string'];
	// $requestParam['uri'] = $request['server']['request_uri'];
	// $requestParam['path_info'] = $request['server']['path_info'];
	// $requestParam['remote_port'] = $request['server']['remote_port'];
	// $requestParam['remote_addr'] = $request['server']['remote_addr'];

    $response->header("Content-Type", "text/plain");
    $response->end("Hello World\n");
    Log::info($request->header);

});


function entry()
{

}



$http->start();




## Websocket 服务
$server = new swoole_websocket_server("127.0.0.1", 88);

$server->on('open', function($server, $req) {
    echo "connection open: {$req->fd}\n";
});

$server->on('message', function($server, $frame) {
    echo "received message: {$frame->data}\n";
    $server->push($frame->fd, json_encode(["hello", "world"]));
});

$server->on('close', function($server, $fd) {
    echo "connection close: {$fd}\n";
});

$server->start();
