<?php
namespace core\redis;
use yii\base\Component;

class RedisClient extends Component
{
    /***
     * @var \Redis;
     */
    public  $connection;
    public  $host;
    public  $port;
    public  $auth;

    public function __construct($config=[])
    {
        parent::__construct($config);
        return;
    }

    /***
     * @return int
     */
    public function init()
    {

    }

    /***
     *  添加一个 在configure 完成后执行的函数
     */
    public function afterConfigure()
    {
        $redisCli = new \Redis;

        if( $redisCli->connect( $this->host, $this->port ) ==false) {
            echo "redis 连接失败 \n";
            return 1;
        }

        if( $this->auth && ($redisCli->auth($this->auth) == false) ) {
            echo "redis 授权失败 \n";
            return 2;
        }
        $this->connection = $redisCli;
        echo "redis 连接成功 \n";
        return 0;
    }

    public function __call($name, $arguments)
    {
        call_user_func([self::class,$name] , $arguments);
    }



}