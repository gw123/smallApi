<?php

/* 数据库配置 */
$config =  array(
        'param'=> require (ROOT_PATH.'/config/param.php'),
        'db' => array(
            //数据库配置
            'host'=>'127.0.0.1',    //服务器地址
            'dbname' => 'edu', // 数据库名
            'username' => 'root', // 用户名
            'password' => 'root', // 密码
            'encode'=>'utf8',//编码
        ),
        'db1' => array(
            //数据库配置
            'host'=>'127.0.0.1',    //服务器地址
            'dbname' => 'edu', // 数据库名
            'username' => 'root', // 用户名
            'password' => '123456', // 密码
            'encode'=>'utf8',//编码
        )
);

return $config;