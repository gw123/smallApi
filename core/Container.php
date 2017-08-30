<?php
namespace core;
use ReflectionClass;
use core\exceptions\InvalidConfigException;


class Container{

    private $_singletons = [];
    private $_definitions = [];
    private $_params = [];
    private $_reflections = [];
    private $_dependencies = [];

    public function set($class,array $definition = [], array $params = [])
    {
        $this->_definitions[$class] = $this->normalizeDefinition($class, $definition);
        $this->_params[$class] = $params;
        unset($this->_singletons[$class]);
        return $this;
    }

    public function get($class, $params = [], $config = [])
    {
        if (isset($this->_singletons[$class])) {
            return $this->_singletons[$class];
        } elseif (!isset($this->_definitions[$class])) {
            return $this->build($class, $params, $config);
        }

        $definition = $this->_definitions[$class];

        $concrete = $definition['class'];
        unset($definition['class']);

        $config = array_merge($definition, $config);
        $params = $this->mergeParams($class, $params);

        if ($concrete === $class) {
            $object = $this->build($class, $params, $config);
        } else {
            $object = $this->get($concrete, $params, $config);
        }

        if (array_key_exists($class, $this->_singletons)) {
            // singleton
            $this->_singletons[$class] = $object;
        }

    }

    protected function mergeParams($class, $params)
    {
        if (empty($this->_params[$class])) {
            return $params;
        } elseif (empty($params)) {
            return $this->_params[$class];
        } else {
            $ps = $this->_params[$class];
            foreach ($params as $index => $value) {
                $ps[$index] = $value;
            }
            return $ps;
        }
    }

    protected function normalizeDefinition($class, $definition)
    {
        if (empty($definition)) {
            return ['class' => $class];
        } elseif (is_string($definition)) {
            return ['class' => $definition];
        }  elseif (is_array($definition)) {
            if (!isset($definition['class'])) {
                if (strpos($class, '\\') !== false) {
                    $definition['class'] = $class;
                } else {
                    throw new InvalidConfigException("A class definition requires a \"class\" member.");
                }
            }
            return $definition;
        }
        throw new InvalidConfigException("Unsupported definition type for \"$class\": " . gettype($definition));
    }

    protected function build($class, $params, $config)
    {
        /* @var $reflection ReflectionClass */
        list ($reflection, $dependencies) = $this->getDependencies($class);
        //var_dump($this->_dependencies);
        foreach ($params as $index => $param) {
            $dependencies[$index] = $param;
        }
        //var_dump($dependencies);
        $dependencies = $this->resolveDependencies($dependencies, $reflection);
        //var_dump($dependencies);
        if (!$reflection->isInstantiable()) {
            throw new NotInstantiableException($reflection->name);
        }
        if (empty($config)) {
            return $reflection->newInstanceArgs($dependencies);
        }

        $object = $reflection->newInstanceArgs($dependencies);
        foreach ($config as $name => $value) {
            $object->$name = $value;
        }
        return $object;

    }

    protected function resolveDependencies($dependencies, $reflection = null)
    {

        foreach ($dependencies as $index => $dependency) {
            if ($dependency instanceof Instance) {
                if ($dependency->id !== null) {
                    $dependencies[$index] = $this->get($dependency->id);
                } elseif ($reflection !== null) {
                    $name = $reflection->getConstructor()->getParameters()[$index]->getName();
                    $class = $reflection->getName();
                    throw new InvalidConfigException("Missing required parameter \"$name\" when instantiating \"$class\".");
                }
            }
        }
        return $dependencies;
    }


    protected function getDependencies($class)
    {
        if (isset($this->_reflections[$class])) {
            return [$this->_reflections[$class], $this->_dependencies[$class]];
        }

        $dependencies = [];
        $reflection = new ReflectionClass($class);

        $constructor = $reflection->getConstructor();
        if ($constructor !== null) {
            foreach ($constructor->getParameters() as $param) {
                if ($param->isDefaultValueAvailable()) {
                    $dependencies[] = $param->getDefaultValue();
                } else {
                    $c = $param->getClass();
                    $dependencies[] = Instance::of($c === null ? null : $c->getName());
                }
            }
        }
       // var_dump($dependencies);
        $this->_reflections[$class] = $reflection;
        $this->_dependencies[$class] = $dependencies;

        return [$reflection, $dependencies];
    }

}