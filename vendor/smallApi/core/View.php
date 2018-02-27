<?php
namespace core;

/***
 * 使用php原生代码
 * Class View
 * @package core
 */
class  View extends Component{

    public function render($filename ,$data)
    {
        $this->data=$data;
        ob_start();
        include ($filename);
        return ob_get_clean();
    }
}