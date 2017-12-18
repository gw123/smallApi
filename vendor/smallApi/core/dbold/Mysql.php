<?php
namespace  core\db;

use core\BaseException;

class Mysql  implements \core\db\Datebase{
    /***
     * @var \mysqli
     */
    public  $link = null; //数据库连接
    private $table; //表名
    private $prefix; //表前缀
    private $db_config; //数据库配置
    private $db_name;
    private $error;
    private $_rt = null;

    private $lastSql; //上一次执行过的sql语句
    /**
     * 参数:表名 数据库配置数组 或 数据库配置文件路径
     * @param $table
     * @param string $db_config_arr_path
     */
    function __construct( $db_config =[])
    {
        $this->db_config = $db_config;

    }

    function __destruct()
    {
        $this->close();
        $this->link = null;
    }

    /*设置数据库要操作的表*/
    function setTable($tablename="")
    {
        $this->table = $this->prefix . $tablename;
    }
    /**
     * 连接数据库
     */
    private function conn()
    {
        $db_config = $this->db_config;
        //var_dump($db_config);
        $host = $db_config["host"];
        $user = $db_config["username"];
        $pwd  = $db_config["password"];

        $db_name  = isset($db_config["dbname"]) ? $db_config['dbname'] : '';
        $this->db_name  = $db_name;
        $db_encode = isset($db_config['charset']) ? $db_config["charset"] : 'utf8';
        $db_port   =isset($db_config['port']) ? $db_config['port'] : 3306;
        $this->prefix = isset($db_config['db_prefix']) ? $db_config["db_prefix"] : '';

        $this->link = mysqli_connect($host, $user, $pwd,$db_name,$db_port) or die('数据库服务器连接错误:' );

        if(!empty($db_name))
            mysqli_select_db($this->link,$db_name) or die('数据库连接错误:' . mysqli_error());
        $this->link->query("set names '$db_encode'");
        //mysqli_query("set names '$db_encode'");
    }

    /*** 过滤函数
     * @param $value
     * @return string
     */
   public function filter($value)
   {
      return  mysqli_real_escape_string($this->link ,$value);
   }

    /*获取表有哪些字段*/
    public function  getFields($table)
    {
        $sql = 'desc '.$table;
        $rt =  $this->link->query($sql);
        $data=array();
        while($rt && $row = mysqli_fetch_assoc($rt) )
        {
            array_push($data  , $row);
        };

        return $data;
    }

    /**
     * 数据查询
     * 参数:sql条件 查询字段 使用的sql函数名
     * @param string $where
     * @param string $field
     * @param string $fun
     * @return array
     * 返回值:结果集 或 结果(出错返回空字符串)
     */
    public function select($table="",$where = '', $field = "*")
    {
        if($table=="") $table=$this->table;

        $rarr = array();
        $sqlStr='';
        if( empty($where) )
        {
            $sqlStr = $table;
            $rt=$this->link->query($sqlStr);
            if(!$rt)
            {
                $this->error = mysqli_error($this->link);
                throw  new  BaseException( $this->error );
            }
            while ($rt && $arr = mysqli_fetch_assoc($rt)) {
                array_push($rarr, $arr);
            }
        } else  {
            $con='';
            if(is_array($where))
            {
                foreach ($where as $key => $value) {
                    $value=mysqli_real_escape_string($this->link,$value);
                    if($con=='')
                        $con.=$key."='{$value}'";
                    else
                        $con.=" and ".$key."='{$value}'";
                }

            }else{
                $con = $where;
            }

            $sqlStr = "select $field from $table where $con";

            $rt=$this->link->query($sqlStr);
            if(!$rt)
            {
                $this->error=mysqli_error($this->link);
                return	false;
            }
            while ($rt && $arr = mysqli_fetch_assoc($rt)) {
                array_push($rarr, $arr);
            }
        }

        $this->lastSql = $sqlStr;
        return $rarr;
    }


    /**
     * 查询第一行
     * 返回值:结果集 或 结果(出错返回空字符串)
     */
    public function queryOne($sqlStr)
    {
        $rt = $this->link->query($sqlStr);
        if($rt)
        {
            $row = mysqli_fetch_assoc($rt);
            if($row)  return $row;
        }
    }

    /**
     * 数据查询 主要应用与count 统计类型的语句
     * 返回值:结果集 或 结果(出错返回空字符串)
     */
    public function queryScalar($sqlStr)
    {
        $rt = $this->link->query($sqlStr);
        if($rt)
        {
            $row = mysqli_fetch_row($rt);
            if($row)  return $row[0];
        }
        return null;
    }


    /**
     * 数据更新
     * 参数:sql条件 要更新的数据(字符串 或 关联数组)
     * @param $where
     * @param $data
     * @return bool
     * 返回值:语句执行成功或失败,执行成功并不意味着对数据库做出了影响
     */
    public function update($data,$where,$table)
    {
        if($data=="")
            return "do nothing";
        $ddata = '';
        if (is_array($data)) {
            while ( list($k, $v) = each($data) ) {
                $v = mysqli_real_escape_string( $this->link , $v );
                if (empty($ddata)) {
                    $ddata = "$k='$v'";
                } else {
                    $ddata .= ",$k='$v'";
                }
            }
        } else {
            $ddata = mysqli_real_escape_string($this->link,$data);
        }

        if(empty($table)) $table=$this->table;


        if(empty($where))
            $sqlStr = "update $table set $ddata";
        else
            $sqlStr = "update $table set $ddata where $where";

        $this->lastSql = $sqlStr;
        return $this->link->query($sqlStr);
    }

    /*
      执行一条更新或者删除语句
    */
    public function  execute($sql)
    {
        $this->lastSql = $sql;
        return $this->link->query($sql);
    }

    public function query($sql)
    {
        $this->lastSql =$sql;
        $this->_rt = $this->link->query($sql);

    }

    public function  readLine()
    {
        if(!$this->_rt)  return false;

        $row = mysqli_fetch_assoc($this->_rt);
        if(!$row)
         $this->_rt = null;
           ;
        return $row;
    }

    /**
     * 数据添加
     * 参数:数据(数组 或 关联数组 或 字符串)
     * @param $data
     * @return int
     * 返回值:插入的数据的ID 或者 0
     */
    public function insert($data , $table="")
    {
        if($table=="") $table=$this->table;

        $field = '';
        $idata = '';
        if (is_array($data) && array_keys($data) != range(0, count($data) - 1)) {
            //关联数组
            while (list($k, $v) = each($data)) {
                //转义特殊字符使其再插入数据库后不会丢失
                $v =  mysqli_real_escape_string( $this->link , $v );
                if (empty($field)) {
                    $field = "$k";
                    $idata = "'$v'";
                } else {
                    $field .= ",$k";
                    $idata .= ",'$v'";
                }
            }
            $sqlStr = "insert into $table($field) values ($idata)";
        } else {
            //非关联数组 或字符串
            if (is_array($data)) {
                $v =  mysqli_real_escape_string( $this->link , $v );
                while (list($k, $v) = each($data)) {
                    if (empty($idata)) {
                        $idata = "'$v'";
                    } else {
                        $idata .= ",'$v'";
                    }
                }

            } else {
                //为字符串
                $idata = $data;
            }
            $sqlStr = "insert into $table values ($idata)";
        }
        $this->lastSql = $sqlStr;

        if($this->link->query($sqlStr))
        {
            return mysqli_insert_id($this->link);
        }
        return null;
    }

    /**
     * 数据删除
     * 参数:sql条件
     * @param $where
     * @return bool
     */
    public function delete($table="",$where)
    {
        if($table=="") $table=$this->table;

        $sqlStr = "delete from $table where $where";
        $this->lastSql = $sqlStr;
        return $this->link->query($sqlStr);
    }

    public  function  getLastSql()
    {
        return $this->lastSql;
    }
    /**
     * 放回上一次报的错误
     * @return bool
     */
    public function getError()
    {
        return  mysqli_error($this->link);
    }

    /**
     * 关闭MySQL连接
     * @return bool
     */
    public function close()
    {
        if($this->link)
         mysqli_close($this->link);
    }


    public function queryAll($sql, $limit = 0)
    {
        $this->lastSql = $sql;

        $rt = $this->link->query($sql);

        if($rt===false)
        {
            $this->error =  mysqli_error($this->link) .EOL." SQL: $sql" ;
            throw  new BaseException($this->error);
        }
        $rows = array();
        while ( $rt &&  $row=mysqli_fetch_assoc($rt) )
        {
            array_push($rows ,$row);
        }
        return $rows;
    }

    public function queryColumn($sql)
    {
        $this->lastSql = $sql;

        $rt = $this->link->query($sql);

        if($rt===false)
        {
            $this->error =  mysqli_error($this->link) .EOL." SQL: $sql" ;
            throw  new BaseException($this->error);
        }
        $rows = array();
        while ( $rt &&  $row=mysqli_fetch_row($rt) )
        {
            array_push($rows ,$row[0]);
        }
        return $rows;
    }

    public function transform($sql, $field)
    {
        $this->lastSql = $sql;
        $rt = $this->link->query($sql);

        if($rt===false)
        {
            $this->error =  mysqli_error($this->link) .EOL." SQL: $sql" ;
            return  false;
        }
        $rows = array();
        while ( $rt &&  $row=mysqli_fetch_assoc($rt) )
        {
            //var_dump($field ,$row);
           $rows[ $row[$field] ] = $row;
        }
        return $rows;
    }
}