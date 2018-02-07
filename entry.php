<?php

#测试进程关系
function getPid($place)
{
   $pid = getmypid();
   echo "{$place}Pid : ".$pid." \n\n";
}

#监听地址 0.0.0.0 是全部地址
$http_server = new swoole_http_server(All::$server_config['bind_addr'], All::$server_config['port']);

#swoole配置
$http_server->set(All::$server_config);

#初始化全局缓冲（分类，user基本信息） 可以通过 redis ， memcache ， 共享内存实现
$http_server->on("start", function ($server) use($http_server){
    $bind_addr = All::$server_config['bind_addr'];
    $bind_port = All::$server_config['port'];
    $str = "Swoole http server is started at {$bind_addr}:{$bind_port}\n";
    $str.="主进程启动 初始化全局缓冲。。。";
    getPid($str);
});

/**
 * Worker进程/Task进程启动时发生。这里创建的对象可以在进程生命周期内使用
 * 完成一些初始化工作 数据库加载 框架初始化 ( 废弃 )
 */
$http_server->on('WorkerStart', function ($serv, $worker_id){
    $str= "工作进程 初始化框架。。。";
    getPid($str);
});

/**
 * Worker进程/Task进程启动时发生。这里创建的对象可以在进程生命周期内使用
 * 完成一些初始化工作 数据库加载 框架初始化
 */
$http_server->on('WorkerStop', function ($serv, $worker_id){
    $str = "进程结束 销毁内存";
    getPid($str);
});

/***
 *
 */
$http_server->on("request", function ($request, $response) {
    \All::dispatch($request,$response);
});

$http_server->on('task',function( $serv,  $task_id,  $src_worker_id,  $data){
    // 这里是task 进程
     if(!isset($data['class'])){
         All::waring('必须指定任务类名'.json_encode($data));
         $serv->finish(['code'=>\api\service\Code::ArgumentError,'msg'=>'必须指定任务类名']);
         return;
    }
    if(!class_exists($data['class'])){
        All::waring('指定任务类不存在:'.$data['class']);
        $serv->finish(['code'=>\api\service\Code::NotFound,'msg'=>'指定任务类不存在']);
        return;
    }

    $task = new $data['class']($serv,$task_id,$src_worker_id,$data);
    if(!$task->beforeRun()){
        $serv->finish(['code'=>\api\service\Code::SysError,'msg'=>$task->getErrors()]);
        return;
    }
    $task_result = $task->run();
    $serv->finish($task_result);
});


$http_server->on('finish',function( $serv,  $task_id,  $data){
    echo "On finish : ".EOL;
    var_dump($data);
});

All::$server = $http_server;

#启动Http服务
$http_server->start();
//后面的代码不在执行


