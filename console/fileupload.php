<?php


$filepath = 'D:\install\cygwin\data\wwwroot\smallApi\public\files\avatar.png';
$data = array('pic'=>new CURLFile($filepath,"png" ));
$ch = curl_init();

$header = array('CLIENT-IP:58.68.44.61',       //模拟客户端ip
    'X-FORWARDED-FOR:58.68.44.62', //模拟客户端ip
    'REMOTE-ADDR:58.68.44.63',      //模拟客户端ip
    'X-Requested-With:XMLHttpRequest',//模拟Ajax
    'User-Agent:Mozilla/5.0 (Windows NT 10.0; WOW64; rv:55.0) Gecko/20100101 Firefox/55.0');   //模拟referer

$url = "http://api.xyt/index/upload";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
curl_setopt($ch, CURLOPT_POST, true );
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch ,CURLOPT_FOLLOWLOCATION ,true);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_getinfo($ch);
//var_dump($res);
$return_data = curl_exec($ch);
curl_close($ch);


//$header = substr($return_data ,0 ,strpos($return_data , "\n\r\n\r") );

var_dump($return_data);