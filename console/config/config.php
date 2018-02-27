<?php
/* 数据库配置 */
$config =  array(
        'params'=> require (ROOT_PATH.'/config/param.php'),
        'components'=>[
            'db' => array(
                 'class' => '\yii\db\Connection',
                 'dsn' => 'mysql:host=xytschool.com;dbname=hpw',
                 'username' => 'rwuser',
                 'password' => 'gao4632',
                 'charset' => 'utf8',
            ),
            'videoDb' => array(
                'class' => '\yii\db\Connection',
                'dsn' => 'mysql:host=xytschool.com;dbname=hpw',
                'username' => 'rwuser',
                'password' => 'gao4632',
                'charset' => 'utf8',
            ),
            'view'=> array(
                'class'=> core\view\TwigView::class,
                'cache'=>false,
                'twigConfig'=>[
                    'debug'=>true,
                    'charset'=>'utf-8',
                    'cache '=> ROOT_PATH."/runtime/view",
                    'auto_reload'=>true,
                    'optimizations '=>'-1',//优化方式的标志(-1，启用所有优化; 0禁用)
                ]
            )
        ]
);

return $config;