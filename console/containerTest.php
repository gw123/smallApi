<?php
namespace console;
use controller\AdminController;
use core\Container;

$container = new \core\Container();

$container->get('controller\AdminController');