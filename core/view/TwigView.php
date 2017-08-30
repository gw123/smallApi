<?php
namespace core\view;
use core\View;

class  TwigView extends View{
    public $cache=false;
    public $twigConfig=[];
    public $viewRootPath = '';

    public function render($filename ,$data)
    {
        if(!$this->viewRootPath)
            $this->viewRootPath = ROOT_PATH.'/view';

        $loader = new \Twig_Loader_Filesystem( $this->viewRootPath);
        $twig =   new \Twig_Environment($loader, $this->twigConfig);
        return $twig->render($filename, $data);
    }
}