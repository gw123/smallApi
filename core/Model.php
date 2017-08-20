<?php
namespace core;

use core\db\Datebase;

class  Model implements \core\db\Datebase{


    public $table = '';
    /**
     * @var db\Mysql|
     */
    public $db = null;
    public $error = null;

    public  $fields = [];

    private $_whereStrs = [];


    public function __construct( \core\db\Datebase $db = null)
    {
        if($this->table=='')
        {
            throw  new BaseException('Model not set table ;');
        }
        if($db==null)
        {
            $this->db = App::$db;
        }else{
            $this->db = $db;
        }
    }

    public function update($data,$condition,$table='')
    {
       if($table=='') $table = $this->table;
       $this->db->update($this->table,$data ,$condition);
    }

    public function insert($data,$table='')
    {
        if($table=='') $table = $this->table;
        $this->db->insert($this->table,$data);
    }

    public function queryOne($sql)
    {
        return $this->db->queryOne($sql);
        // TODO: Implement one() method.
    }

    public function queryScalar($sql)
    {
        return $this->db->queryScalar($sql);
        // TODO: Implement scalar() method.
    }

    public function queryAll($sql, $limit = 0)
    {
        // TODO: Implement all() method.
        return $this->db->queryAll($sql,$limit);
    }

    public function queryColumn($sql)
    {
        return $this->db->queryColumn($sql);
    }

    public function transform($sql, $field)
    {
        return $this->db->transform($sql ,$field);
        // TODO: Implement transform() method.
    }

    public function query($sql){
        return $this->db->query($sql);
    }

    public function execute($sql){
        return $this->db->execute($sql);
    }

    public function getLastSql(){
        return $this->db->getLastSql();
    }

    public function   getError(){
      return $this->error;
    }


    public function addFilterWhere($condition)
    {
        if( is_array($condition) )
        {
            foreach ($condition as $key=>$value)
            {
                if((empty($value)&&$value!=='0')||$value=='_') continue;
                $value = mysqli_real_escape_string( $this->db->link ,$value);
                $this->_whereStrs[] = '`'.$key.'`'.'='."'".$value."'";
            }
        }else{
               $this->_whereStrs[] = $condition;
        }
    }

    /***
     *  条件列表函数
     * @param $condition 条件 string|array
     * @param $page      当前页
     * @param $pageSize  分页大小
     * @return mixed
     */
    public function  lists( Array $fields =array(),  $page=1 ,$pageSize=10 ){
        $page = intval($page) ? intval($page):1 ;
        $pageSize = intval($pageSize) ? intval($pageSize) :10;

        $limit = " limit ".(($page-1)*$pageSize) .",".$pageSize;

        $fieldStr = implode(',' ,$fields);

        if(empty($fields))
        {
            $fieldStr = ' * ';
        }

        $sql     = "select ".$fieldStr." from ".$this->table ;
        $conditionStr = '';

        if(!empty($this->_whereStrs))
        {
            $conditionStr =  ' where '.implode(' and ' , $this->_whereStrs);
        }

        $sql.=" ".$conditionStr." ".$limit;
        //echo $sql; exit();
        if(empty($conditionStr))
        {
            $totalsql = "select count(*) from ".$this->table;
        }else{
            $totalsql = "select count(*) from ".$this->table.$conditionStr;
        }
        //$totalsql =  "SELECT NUM_ROWS FROM `information_schema`.`INNODB_SYS_TABLESTATS` WHERE `NAME`='{$this->table}'";
        //echo $totalsql;
        $records = $this->db->queryScalar($totalsql);
        //echo $sql;
        //App::$log->info($sql);
        $list  = $this->db->queryAll($sql,$limit);

        if($list===false)
        {
            App::$log->out($this->db->getError(),__FILE__,__LINE__);
            $list = [];
        }
        $totalPage = ceil($records/$pageSize);
        return array('records'=>$records ,'total'=>$totalPage ,'page'=>$page, 'rows'=>$list  );
    }

}