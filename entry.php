<?php
error_reporting(E_ALL);
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

## 日志服务 
include('core/logger.php');
## 基础服务入口
$httpServerConf = [
    'port'=>82,
    'bind_addr'=>"0.0.0.0.0"
];
#测试进程关系
function getPid($place)
{
   $pid = getmypid();
   echo "Place -> \n".$place;
   echo "Current process Pid : ".$pid." \n\n";
}
//getPid('entry');
#监听地址 0.0.0.0 是全部地址
$http = new swoole_http_server("0.0.0.0", 82);

#swoole配置
$http->set(array(
    //'daemonize '=>0, //守护进程化
    // 'pid_file' =>'/var/run/swoole.pid',
    //'log_file'=>'/data/log/swoole.log',

    'worker_num' => 3,    //响应解析 回复 http 请求
    'backlog' => 128,       //listen backlog
    'max_request' => 100,  // 一个worker进程在处理完超过此数值的任务后将自动退出，进程退出后会释放所有内存和资源。
    'dispatch_mode'=>1,

    'task_max_request '=>100, //同工作进程的 max_request
    'task_worker_num '=>10, //任务进程数量 执行耗时操作数量应该大于 worker

    'http_parse_post' => true ,//自动将Content-Type为x-www-form-urlencoded的请求包体解析到POST数组

    'document_root' => '/data/wwwroot/smallApi/frontend/public',
    'enable_static_handler' => true,
    //'user'=>'www' //worker 进程用户，仅在使用root用户启动时有效
));

#redis
$redisCli = new Redis;
$redisCli->connect('0.0.0.0', 6379);

#初始化全局缓冲（分类，user基本信息） 可以通过 redis ， memcache ， 共享内存实现
$http->on("start", function ($server) {
	global $httpServerConf;
    //$str = 'http on start callback\n';
    $str = "Swoole http server is started at {$httpServerConf['bind_addr']}:{$httpServerConf['port']}\n";
    $str.="主进程启动 初始化全局缓冲。。。\n";
    getPid($str);
});

/**
 * Worker进程/Task进程启动时发生。这里创建的对象可以在进程生命周期内使用
 * 完成一些初始化工作 数据库加载 框架初始化
 */
$http->on('WorkerStart', function ($serv, $worker_id){
    $str= "工作进程 初始化框架。。。\n";
    getPid($str);
    require('core/All.php');
    require('core/Request.php');
});

/**
 * Worker进程/Task进程启动时发生。这里创建的对象可以在进程生命周期内使用
 * 完成一些初始化工作 数据库加载 框架初始化
 */
$http->on('onWorkerStop', function ($serv, $worker_id){
    $str = "进程结束 销毁内存\n";
    getPid($str);
});
//$session_table = new swoole_table(100000);


/***
 *
 */
$http->on("request", function ($request, $response) {

    global $redisCli;
    // getPid('http on request Count:'.$count." ");
    $baseRequest = new \core\Request($request , $response,$redisCli );
    $result = $baseRequest->runRouter();

    if( $result===false )
    {
        $response->header( "HTTP/1.1 302" ,"Moved Permanently" );
        $response->header( 'Content-type',' text/html;charset=utf-8' );
        $response->header('Location','404.html');
        $response->end('404 not found!');
        return;
    }
    //$response->header("Content-Type", "text/plain");
    $response->end($result);
    Log::info($request->header);
});

#启动Http服务
$http->start();
