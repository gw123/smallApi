<?php
/***
 *  监听nginx 的日志
 */
require_once (dirname(__DIR__)."/util/mail.php");
$filepath = '/data/log/nginx';
$fd = inotify_init();
//监听文件，仅监听修改操作，如果想要监听所有事件可以使用IN_ALL_EVENTS
$watch_descriptor = inotify_add_watch($fd, $filepath, IN_MODIFY);
$sub_files = [];
$files = getDir($filepath);
foreach ($files as $temp) {
    $sub_files[$temp]['pos'] = filesize($temp);
    //$sub_files[$temp]['fd'] =  fopen($temp ,'r');
}
//message
$mseeage_queue = [];

//加入到swoole的事件循环中
swoole_event_add( $fd, function ($fd) use($filepath , &$sub_files,&$mseeage_queue) {
    $events = inotify_read($fd);
    //替换原来的监听,在文件被删除时需要重新建立连接http://blog.csdn.net/cool_way/article/details/22827433
    $date = date("Y-m-d H:i:s",time());;
    if ($events) {
        foreach ($events as $event) {
            //过滤 swp文件
            if( substr($event['name'],strrpos($event['name'],'.swp'))=== '.swp'  ) {
                //echo "event:".$event['name']."\n";
                return ;
            }
            $fullpath = $filepath."/".$event['name'];

            if(!isset($sub_files[$fullpath]) ) {
                $sub_files[$fullpath]['pos'] = 0;
                //$sub_files[$fullpath]['fd'] =  fopen($fullpath ,'r');
            }
            $last_pos = $sub_files[$fullpath]['pos'];
            //echo $last_pos."\n";
            $file_p = fopen($fullpath ,'r');

            fseek($file_p,$last_pos);

            while (!feof($file_p)) {
                $buf = fgets($file_p,8192);
                if( strpos($buf,' 200 ') !== false||strpos($buf,' 302 ') !== false||strpos($buf,' 304 ') !== false) {
                }else {
                    //添加到处理异常队列
                    $mseeage_queue[] = $buf;
                }
            }
            //更新
            $sub_files[$fullpath]['pos'] = ftell($file_p);
            fclose($file_p);
        }
    }
    inotify_add_watch($fd, $filepath, IN_MODIFY);
});

//5秒后发送异常通知 避免频繁发送
swoole_timer_tick(5000,function ($timer_id) use(&$mseeage_queue){
    if(empty($mseeage_queue) ) {
      return;
    }
    $msg =  json_encode($mseeage_queue);
    sendMail($msg);
    $mseeage_queue = [];

});

function getDir($dir) {
    $dirArray[]=NULL;
    if (false != ($handle = opendir ( $dir ))) {
        $i=0;
        while ( false !== ($file = readdir ( $handle )) ) {
            //去掉"“.”、“..”以及带“.xxx”后缀的文件
            if ($file != "." && $file != "..") {
                $dirArray[$i] = $dir.'/'.$file;
                $i++;
            }
        }
        //关闭句柄
        closedir ( $handle );
    }
    return $dirArray;
}

