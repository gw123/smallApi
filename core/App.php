<?php
namespace  core;
use core\All;
use  core\Container;
use core\exceptions\InvalidConfigException;

/***
 * @property \yii\db\Connection $db The database connection. This property is read-only.
 * @property \core\redis\RedisClient $redis The database connection. This property is read-only.
 * @property \core\view $view The database connection. This property is read-only.
 * @property \lib\Log $log The database connection. This property is read-only.
 * @package core
 */
class App extends Component{

    /**
     * @var array shared component instances indexed by their IDs
     */
    private $_components = [];
    /**
     * @var array component definitions indexed by their IDs
     */
    private $_definitions = [];

     //App参数
     public    $param = array();

     public function __construct(array  $config)
     {
         if(isset($config['components']))
          $this->setComponents($config['components']);
    //          $this->db = $this->get('db');
    //          $this->view =$this->get('view');
    //          $this->log = $this->get('log');
    //         $this->db      =  new  \core\db\Mysql($this->config['db']);
    //         $this->db_ecstore = new  \core\db\Mysql($this->config['ecstore']);
    //         $this->log     =  new  \lib\Log();
    //         $this->param   =  $config['param'];
     }

     public  function run()
     {
         \core\Router::run();
     }

     public   function getConfig(string $key)
     {
         if(isset($this->config[$key]))
         {
            return $this->config;
         }
         return null;
     }

    public function get($id, $throwException = true)
    {
        if (isset($this->_components[$id])) {
            return $this->_components[$id];
        }

        if (isset($this->_definitions[$id])) {
            $definition = $this->_definitions[$id];
            if (is_object($definition) && !$definition instanceof Closure) {
                return $this->_components[$id] = $definition;
            } else {
                return $this->_components[$id] = All::createObject($definition);
            }
        } elseif ($throwException) {
            throw new InvalidConfigException("Unknown component ID: $id");
        } else {
            return null;
        }
    }

    public function set($id,array $definition)
    {
        if ($definition === null) {
            unset($this->_components[$id], $this->_definitions[$id]);
            return;
        }

        unset($this->_components[$id]);

        if (isset($definition['class'])) {
            $this->_definitions[$id] = $definition;
        } else {
            throw new InvalidConfigException("The configuration for the \"$id\" component must contain a \"class\" element.");
        }
    }

     public   function __get($name)
     {
         return $this->get($name);
     }

     public function setComponents($components)
     {
        foreach ($components as $id => $component) {
            $this->set($id, $component);
        }
     }
}

