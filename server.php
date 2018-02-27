<?php
//APP 命名空间
define("APP_ROOT_NAMESPACE", '\\'.substr(APP_PATH,strrpos(APP_PATH,DIRECTORY_SEPARATOR)+1));
define('EOL', (PHP_SAPI == 'cli') ? PHP_EOL: '<br />'."\n" );

///实现 session 机制
if(!defined('SESSION_TYPE')) {
    define( 'SESSION_TYPE', 'get');
}
if(!defined('SESSION_COOKIE_NAME')) {
    define( 'SESSION_COOKIE_NAME', 'SMALLAPI_SES');
}
if(!defined('SESSION_ID_PRE')) {
    define( 'SESSION_ID_PRE', 'SESSION_');
}

//创建channel  连接
$channel = new Swoole\Channel(60000);
All::$channel = $channel;

//记录 websocket 连接
All::$web_socket_fds = new  \Swoole\Table(65536);
All::$web_socket_fds->column('session_id', \Swoole\Table::TYPE_STRING,48);
All::$web_socket_fds->column('is_debug', \Swoole\Table::TYPE_INT,1);
All::$web_socket_fds->column('ip', \Swoole\Table::TYPE_STRING,15);
All::$web_socket_fds->create();

//创建websocket服务
$http_server = new swoole_websocket_server(All::$server_config['bind_addr'], All::$server_config['port']);

All::$server = $http_server;

//设置swoole配置
$http_server->set(All::$server_config);

/***
 * 在onStart中创建的全局资源对象不能在worker进程中被使用，因为发生onStart调用时，worker进程已经创建好了。
 * 新创建的对象在主进程内，worker进程无法访问到此内存区域。
 * 因此全局对象创建的代码需要放置在swoole_server_start之前。
 */
$http_server->on("start", function (swoole_websocket_server $server) {
    $bind_addr = All::$server_config['bind_addr'];
    $bind_port = All::$server_config['port'];
    $str = "Swoole http server is started at {$bind_addr}:{$bind_port}\n";
    $str.="主进程启动 \n";
    echo $str;
});

/**
 * Worker进程/Task进程启动时发生。这里创建的对象可以在进程生命周期内使用
 * 完成一些初始化工作 数据库加载 框架初始化 ( 废弃 )
 */
$http_server->on('WorkerStart', function (swoole_websocket_server $server, $worker_id){

    if(!$server->taskworker){
        $str= "Worker 进程 初始化框架。。。\n";
    }else{
        $str= "Task 初始化框架。。。\n";
    }
    echo $str;

    //加载配置文件app 的配置放在这里加载是为了，在reload 时候可以动态改变
    if(!is_file(ROOT_PATH."/config/config.php")) {
        echo "缺少配置文件：".ROOT_PATH."/config/config.php \n";
        $server->shutdown();
        return;
    }
    $commonConfig   = require ( ROOT_PATH."/config/config.php" );
    $appConfig      = require ( APP_PATH."/config/config.php" );
    $config['components']  = array_merge($commonConfig['components'], $appConfig['components']);
    $config['params']      = array_merge($commonConfig['params'], $appConfig['params']);
    if(is_file(APP_PATH."/config/dynamic_config.php" )) {
        $config['dynamic_params'] = require ( APP_PATH."/config/dynamic_config.php" );
    }

    //自定义路由
    All::$routers       = require(ROOT_PATH."/config/route.php");
    // 在worker task 进程中初始化app实例
    All::$app           = new core\App($config);
    //初始化动态参数
    if(isset($config['dynamic_params'])) {
        foreach ($config['dynamic_params'] as $key => $value) {
            if(!All::$app->redis->hExists('dynamic_params', $key)) {
                All::$app->redis->hSet('dynamic_params', $key, $value);
            }
        }
    }

    /**
     * E_ALL =》运行错误
     */
    set_error_handler(function($errno ,$errmsg,$errfile,$errline)
    {
        $msg = "File : ".$errfile." => ".$errline ."\n Msg: " . $errmsg."\n";
        echo $msg;
        All::logger($msg ,'sys_waring');
    });

    /**处理语法错误*/
    register_shutdown_function(function(){
        $msg = error_get_last();
        echo "语法错误；\n";
        print_r($msg);
        echo "\n swoole 调试信息 : \n";
        $msg['message'] = str_replace("\n"," ",$msg['message']);
        All::logger( $msg,'sys_waring');
    });

});

/**
 * Worker进程/Task进程启动时发生。这里创建的对象可以在进程生命周期内使用
 * 完成一些初始化工作 数据库加载 框架初始化
 */
$http_server->on('WorkerStop', function ($server, $worker_id){
    $str = "进程结束 销毁内存";
    logger_running($str);
});

/***
 * 管理进程，在这里实现远程重启操作
 */
$process = new swoole_process(function( swoole_process $process) use ($http_server, $channel) {

    $commonConfig   = require (ROOT_PATH."/config/config.php" );
    $appConfig      = require (APP_PATH."/config/config.php" );
    $config['components']  = array_merge($commonConfig['components'] , $appConfig['components']);
    $config['params']      = array_merge($commonConfig['params'] , $appConfig['params']);
    if(is_file(APP_PATH."/config/dynamic_config.php" )) {
        $config['dynamic_params'] = require ( APP_PATH."/config/dynamic_config.php" );
    }
    All::$app              = new core\App($config);

    swoole_timer_tick(1000, function ()use($http_server, $channel){

         while($data = $channel->pop()) {
             if($data=='reload'){
                 echo "Reload\n";
                 $http_server->reload();
             }
             if(isset($data['type'])){
                 $type = $data['type'];
                 switch ($type){
                     case 'logger':
                         $log_data = $data['data'];
                         $group = $data['group'];
                         foreach (\All::$web_socket_fds as $fd =>$value) {
                             if(in_array($value['ip'], \All::$server_config['debug_ip'])) {
                                 \All::push($fd, $log_data , 'log' , $group);
                             }
                         }
                         break;
                 }
             }
         }
     });

    /***
     * 定时更新系统信息
     */
    swoole_timer_tick(2000,function ()use($http_server, $channel) {
        exec('top -n 1 -b -c', $out);
        All::$app->redis->set('sysinfo', json_encode($out));
    });

});
$http_server->addProcess($process);

$http_server->on('open', function (swoole_websocket_server $server, swoole_http_request $request) {
    $fd = $request->fd;
    $data['ip'] = $request->server['remote_addr'];
    All::$web_socket_fds->set($fd , $data);
});

$http_server->on('close', function ($ser, $fd) {
    if(All::$web_socket_fds->exist($fd)){
        All::$web_socket_fds->del($fd);
    }
});

$http_server->on('message', function (swoole_websocket_server $server, $frame) {
    All::dispatchWs($frame, $server);
});

$http_server->on("request", function ($request, $response) {
    if(isset($request->header['sec-websocket-version'])) {
        return;
    }
    \All::dispatch($request, $response);
});

$http_server->on('task',function(swoole_http_server $server, $task_id, $src_worker_id, $data){
     // 这里是task 进程
     if(!isset($data['class'])) {
         All::error('必须指定任务类名'.json_encode($data), __FILE__, __LINE__);
         $server->finish(['code'=>\api\service\Code::ArgumentError, 'msg'=>'必须指定任务类名']);
         return;
    }
    if(!class_exists($data['class'])){
        All::error('指定任务类不存在:'.$data['class'], __FILE__, __LINE__);
        $server->finish(['code'=>\api\service\Code::NotFound,'msg'=>'指定任务类不存在']);
        return;
    }
    if(!isset($data['data'])) {
        $data['data'] = [];
    }

    $task = new $data['class']($server, $task_id, $src_worker_id, $data['data']);
    if(!$task->beforeRun()){
        $server->finish(['code'=>\api\service\Code::SysError, 'msg'=>$task->getErrors()]);
        return;
    }
    $task_result = $task->run();
    $wrap_result['task_id'] =  $task_id;
    $wrap_result['src_worker_id'] = $src_worker_id;
    $wrap_result['class'] = $data['class'];
    $wrap_result['input'] = $data['data'];
    $wrap_result['result'] = $task_result;

    $server->finish($wrap_result);
});

//正在实现一个任务关系拓补....
$http_server->on('finish',function( $server, $task_id, $data){
//     $task_tree = [
//         \api\task\LoggerTask::class => \api\task\CountTask::class,
//     ];
});

#启动Http服务后面的代码不在执行
$http_server->start();




