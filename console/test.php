<?php

$url = "http://api.xyt/index/index";
$header = array('CLIENT-IP:58.68.44.61',       //模拟客户端ip
                'X-FORWARDED-FOR:58.68.44.62', //模拟客户端ip
                'REMOTE-ADDR:58.68.44.63',      //模拟客户端ip
                'X-Requested-With:XMLHttpRequest',//模拟Ajax
                'Referer:www.xytschool.com');   //模拟referer
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
curl_setopt($ch, CURLOPT_RETURNTRANSFER,true);
curl_setopt($ch, CURLOPT_POST,true);
$page_content = curl_exec($ch);curl_close($ch);
echo $page_content;
?>


