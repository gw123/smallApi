<?php
namespace  core;

class  Router {
    /****
     *  解析路由
     */
    public static function parseRouter( $path_info )
    {
        $url = $path_info;
        $url = str_replace('\\','/',$url);
        //去掉入口php文件
        $url = str_replace( substr(ENTRY_FILENAME,strrpos(ENTRY_FILENAME,'/')),'',$url );

        if( strpos($url,'?') )
            $url = substr( $url , 0, strpos($url , '?'));

        // 优先静态路由
        if( array_key_exists($url , \ALL::$routers ) )
        {
            $url = \ALL::$routers[$url];
        }

        $tempPath = explode('/',$url);
        array_shift( $tempPath );

        $controller = isset($tempPath[0])&&!empty($tempPath[0]) ? $tempPath[0] :'Index';
        $action = isset($tempPath[1])&&!empty($tempPath[1]) ? $tempPath[1] :'Index';
        $controller = ucfirst($controller);
        $action = ucfirst($action);

        return [$controller,$action];
    }
}