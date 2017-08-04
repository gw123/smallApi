<?php
namespace  core\db;

abstract class   Datebase{

    abstract public function query($sql);

    abstract public function execute($sql);

    abstract public function getLastSql();

    abstract public function   getError();
}