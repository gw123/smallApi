<?php
namespace  core;

abstract  class  Task {

    public $server;
    public $task_id;
    public $work_id;
    public $data;
    public $errors;

    public function __construct($server,$task_id,$work_id,$data)
    {
        $this->server = $server;
        $this->task_id = $task_id;
        $this->work_id = $work_id;
        $this->data = $data;
    }
    function getErrors()
    {
        return $this->errors;
    }
    function beforeRun(){
        return true;
    }
    abstract function run();


}