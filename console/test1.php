<?php

class Foo{
    public function test(){
        var_dump('get_class',get_class());
    }

    public function test2(){
        var_dump('get_called_class',get_called_class());
    }

    public static function test3(){
        var_dump('get_class',get_class());
    }

    public static function test4(){
        var_dump('get_called_class',get_called_class());
    }
}

class B extends Foo{

}

$B=new B();
$B->test();
$B->test2();
B::test3();
B::test4();
Foo::test3();
Foo::test4();
