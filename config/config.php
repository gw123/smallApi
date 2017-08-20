<?php

/* 数据库配置 */
$config =  array(
        'param'=> require (ROOT_PATH.'/config/param.php'),
        'ecstore1' => array(
            //数据库配置
            'host'=>'192.168.1.60',    //服务器地址
            'dbname' => 'ecstore', // 数据库名
            'username' => 'zhiwo_w', // 用户名
            'password' => '123456', // 密码
            'encode'=>'utf8',//编码
        ),
        'ecstore' => array(
            //数据库配置
            'host'=>'127.0.0.1',    //服务器地址
            'dbname' => 'ecstore', // 数据库名
            'username' => 'root', // 用户名
            'password' => 'root', // 密码
            'encode'=>'utf8',//编码
        ),
        'db' => array(
            //数据库配置
            'host'=>'127.0.0.1',    //服务器地址
            'dbname' => 'edu', // 数据库名
            'username' => 'root', // 用户名
            'password' => 'root', // 密码
            'encode'=>'utf8',//编码
        ),
       'twig'=> array(
           'debug'=>true,
           'charset'=>'utf-8',
           'cache '=> ROOT_PATH."/runtime/view",
           'auto_reload'=>true,
           'optimizations '=>'-1',//优化方式的标志(-1，启用所有优化; 0禁用)

       )
);

return $config;