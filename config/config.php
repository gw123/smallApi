<?php

/* 数据库配置 */
$config =  array(
        'param'=> require (ROOT_PATH.'/config/param.php'),
        'components'=>array(
            'caiji' => array(
                'class'=> core\db\Mysql::class,
                //数据库配置
                'host'=>'127.0.0.1',    //服务器地址
                'dbname' => 'caiji', // 数据库名
                'username' => 'root', // 用户名
                'password' => 'root', // 密码
                'encode'=>'utf8',//编码
            ),
//            'db' => array(
//                'class'=> core\db\Mysql::class,
//                //数据库配置
//                'host'=>'127.0.0.1',    //服务器地址
//                'dbname' => 'edu', // 数据库名
//                'username' => 'root', // 用户名
//                'password' => 'root', // 密码
//                'encode'=>'utf8',//编码
//            ),
            'db' => [
                 'class' => '\yii\db\Connection',
                 'dsn' => 'mysql:host=192.168.134.1;dbname=test',
                 'username' => 'root',
                 'password' => 'root',
                 'charset' => 'utf8',
             ],
            'redis'=>[
                'class'=>core\redis\RedisClient::class,
                'host'=>'127.0.0.1',
                'port'=>6379,
                'auth'=>'gao123456'
            ],
            'log'=>array(
                'class'=> lib\Log::class,
            ),
            'view'=> array(
                'class'=> core\view\TwigView::class,
                'cache'=>false,
                'twigConfig'=>array(
                    'debug'=>true,
                    'charset'=>'utf-8',
                    'cache '=> APP_PATH."/runtime/view",
                    'viewRootPath '=> APP_PATH.'/view',
                    'auto_reload'=>true,
                    'optimizations '=>'-1',//优化方式的标志(-1，启用所有优化; 0禁用)
                )
            )
        )
);

return $config;