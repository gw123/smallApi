<?php
namespace core\redis;

class RedisClient
{
    /***
     * @var \Redis;
     */
    public  $connection;
    public  $host;
    public  $port;
    public  $auth;

    public function __construct()
    {
        $ret = $this->conn();
        if( $ret == 0 )
        {
            echo "redis 连接成功 \n";
        }else{
            echo "redis 连接失败 \n";
        }
        return;
    }

    /***
     * @return int
     */
    protected function conn()
    {
        $redisCli = new \Redis;
        if( $redisCli->connect('0.0.0.0', 6379) ==false)
        {
            return 1;
        }

        if( $this->auth && ($redisCli->auth($this->auth) == false) )
        {
            return 2;
        }
        $this->connection = $redisCli;

        return 0;
    }
}