# smallApi
使用php写的一个轻量的框架，实现依赖注入，事件机制 

##目录说明
### public 为了安全 public 是外界访问根目录 ，其中 api.php 是入口文件
### config 是配置文件路径
### controller 是控制器目录
### core 是框架核心代码目录
### lib  是存放一些库函数的地方
### runtime 是存放日志和view 缓冲等
### service 是逻辑层代码 
### vendor 是使用composer 安装的库所在目录

目前实现试图层可以使用 原生php，twig 两种模式
该框架有很多不完善的地方 ，优点是简单 ，扩展性高 去掉了框架层的包袱更注重页码逻辑和PHP本身的基础


## 支持swoole  get post 用swoole实现
## 上传文件用一个专有的服务器
