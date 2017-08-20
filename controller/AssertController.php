<?php
namespace controller;
use core\App;
use core\Controller;
use service\enums\ShipEnum;
class  AssertController extends  Controller
{
    public  function  constantJsAction(){
        //return  $this->asJson(ShipEnum::getAttributes());
        $js = " Constants = ". json_encode(ShipEnum::getAttributes()).";\n";
        $js.=" //console.log(constants); ";
        return  $this->asJs($js);
    }
}