<?php
namespace  core\db;

interface   Datebase{

    public function query($sql);

    public function execute($sql);

    public function getLastSql();

    public function  getError();

    public function  update($data,$condition,$table);

    public function  insert($data,$table);

    /***
     * 获取第一行
     * @param $sql
     * @return mixed
     */
    public function  queryOne($sql);

    /***
     * 获取第一行第一个数据
     * @param $sql
     * @return mixed
     */
    public function   queryScalar($sql);

    /***
     *  获取所以数据
     * @param $sql
     * @return mixed
     */
    public function   queryAll($sql , $limit=0);

    /***
     *  将数组中的一个字段作为主键
     * @param $sql
     * @param $field
     * @return mixed
     */
    public function  transform($sql , $field);



}