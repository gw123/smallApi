<?php
namespace lib;

use core\Controller;

class  Curl {
protected $_useragent = 'Mozilla/4.1 (compatible; MSIE 6.0; Windows NT 5.1';
protected $_content_Type = 'Content-Type: application/x-www-form-urlencoded; charset=utf-8';
protected $_header = [];
protected $_url;
protected $_followlocation;
protected $_timeout;
protected $_maxRedirects;
protected $_cookieFileLocation = './cookie.txt';
protected $_post;
protected $_postFields;
protected $_referer ="http://localhost";

protected $_session;
protected $_webpage;
protected $_includeHeader;
protected $_noBody;
protected $_status;
protected $_binaryTransfer;
public    $authentication = 0;
public    $auth_name      = '';
public    $auth_pass      = '';

public function useAuth($use){
$this->authentication = 0;
if($use == true) $this->authentication = 1;
}

public function setName($name){
$this->auth_name = $name;
}
public function setPass($pass){
$this->auth_pass = $pass;
}

public function __construct(string $url,$followlocation = true,$timeOut = 30,$maxRedirecs = 4,$binaryTransfer = false,$includeHeader = false,$noBody = false)
{
$this->_url = $url;
$this->_followlocation = $followlocation;
$this->_timeout = $timeOut;
$this->_maxRedirects = $maxRedirecs;
$this->_noBody = $noBody;
$this->_includeHeader = $includeHeader;
$this->_binaryTransfer = $binaryTransfer;

$this->_cookieFileLocation = dirname(__FILE__).'/cookie.txt';

}

//设置 文件头
public  function setHeader($header)
{
$this->_header = $header;
}

//追加到文件头的末尾
public  function  addHeader($headerItem)
{
if(!empty(trim($headerItem)))
$this->_header[] = $headerItem;
}

// 设置内容编码
public  function  setContentType($type=1)
{
if($type ==1)
{
$this->_content_Type = 'Content-Type: application/x-www-form-urlencoded; charset=utf-8';
}else if($type == 2)
{
$this->_content_Type= 'Content-Type:  multipart/form-data';
}else if($type==4)
{
$this->_content_Type = 'Content-Type: application/json';
}else if($type==5)
{
$this->_content_Type = 'Content-Type: application/html';
}else if($type==6)
{
$this->_content_Type = 'Content-Type: application/xml';
}

}

public function setReferer($referer){
$this->_referer = $referer;
}

public function setCookiFileLocation($path)
{
$this->_cookieFileLocation = $path;
}

public function setPost ($postFields)
{
$this->_post = true;
$this->_postFields = $postFields;
}

public function setUserAgent($userAgent)
{
$this->_useragent = $userAgent;
}

public function createCurl($url = 'nul')
{
    if($url != 'nul'){
        $this->_url = $url;
    }
    $this->_header[] = $this->_useragent;
    $this->_header[] = $this->_content_Type;
    $s = curl_init();
    curl_setopt($s,CURLOPT_URL,$this->_url);
    curl_setopt($s,CURLOPT_HTTPHEADER, $this->_header);
    curl_setopt($s,CURLOPT_TIMEOUT,$this->_timeout);
    curl_setopt($s,CURLOPT_MAXREDIRS,$this->_maxRedirects);
    curl_setopt($s,CURLOPT_RETURNTRANSFER,true);
    curl_setopt($s,CURLOPT_FOLLOWLOCATION,$this->_followlocation);
    curl_setopt($s,CURLOPT_COOKIEJAR,$this->_cookieFileLocation);
    curl_setopt($s,CURLOPT_COOKIEFILE,$this->_cookieFileLocation);

    curl_setopt($s, CURLOPT_SSL_VERIFYPEER, FALSE);
    curl_setopt($s, CURLOPT_SSL_VERIFYHOST, FALSE);


    if($this->authentication == 1){
    curl_setopt($s, CURLOPT_USERPWD, $this->auth_name.':'.$this->auth_pass);
    }
    if($this->_post)
    {
    curl_setopt($s,CURLOPT_POST,true);
    curl_setopt($s,CURLOPT_POSTFIELDS,$this->_postFields);

    }

    if($this->_includeHeader)
    {
    curl_setopt($s,CURLOPT_HEADER,true);
    }

    if($this->_noBody)
    {
    curl_setopt($s,CURLOPT_NOBODY,true);
    }
    /*
    if($this->_binary)
    {
    curl_setopt($s,CURLOPT_BINARYTRANSFER,true);
    }
    */
    curl_setopt($s,CURLOPT_USERAGENT,$this->_useragent);
    curl_setopt($s,CURLOPT_REFERER,$this->_referer);

    $this->_webpage = curl_exec($s);
    $this->_status = curl_getinfo($s,CURLINFO_HTTP_CODE);
    curl_close($s);

}

public function getHttpStatus()
{
return $this->_status;
}

public function tostring(){
return $this->_webpage;
}
}

//$curl = new Curl('https://passport.csdn.net/account/login?from=http://my.csdn.net/my/mycsdn');
//
//  $curl = new Curl('http://pingce.yanxiu.com/admin/login');
//  $arr = ['username'=>'admin',
//              'password'=>'1'
//  ];
//
//   $data= http_build_query($arr , '' , '&');
//   // 发送post数据必须设置 将数组 http_build_query
//   // 直接发送数组采用 multipart/form-data 编码
//   $curl->setPost( $data  );
//   $curl->createCurl();
//
//   echo $curl->tostring();

/**
 * 下载并替换图片
 * @param $content
 * @return mixe
 *
 */


function  replaceImage( $content  )
{
    global $has_error;
    // 去除title   alt   _src 标记
    $rule1 = '/ ((title=\"[^"]*\")|(alt=\"[^"]*\")|(oldsrc=\"[^"]*\"))/';
    $content = preg_replace($rule1,'',$content);
    $rule = '/<img([^>]*)\s* src=(\'|\")([^\'\"]+)(\'|\") ([^>]*)(\/)?>/';

    $content = preg_replace_callback( $rule , function($match){
        $url = $match[3];
        $style1 = $match[1];   //var_dump($match); exit();
        $style2 = $match[5];
        $newUrl = download($url);
        //var_dump($match);
        if(!$newUrl)
        {
            echo "$url download  faild ... \n";
        }
        $img =  "<img src='{$newUrl}' {$style1} {$style2} />";
        return $img;
    } , $content );
    return $content;
}

function   download($url )
{
    if(strpos($url,'http://')===false)
    $url = PC_host.$url;

    $relativePath  = PC_relative_path;
    $webRoot = PC_web_root;

    $image = @file_get_contents($url);
    $md5 = md5($image);
    if(empty($image)) return false;

    $ext = substr( $url , strripos($url, '.')+1);

    $time = time();
    $date = date("Ymd", $time);
    $path = $relativePath."/".$date.'/';

    $filename=$md5.'.'.$ext;
    $fullPath = $webRoot.'/'.$path.$filename;

    if( !is_dir($webRoot.'/'.$path) )   mkdir($webRoot.'/'.$path,0777,true);
    file_put_contents($fullPath,$image);

    $newUrl =  $path.'/'.$filename;
    return $newUrl;
}

/**
 * 下载音频 并且修改音频信息
 * @param $url
 */
function  downloadAudio($url)
{
    if(empty($url)) return false;
    echo "## $url \n";
    global $STATIC_CDN_URL;
    global $STATIC_CDN_ROOT_DIR;

    $image = file_get_contents($url);
    if(empty($image))  return false;

    $root = $STATIC_CDN_ROOT_DIR.'/';
    $time = time()-rand(100,2592000);

    $date = date("Y/md",$time);
    $path ='audio1/'.$date.'/';
    $filename= md5( $time ).rand(100000,999999).'.mp3';
    $fullPath = $root.$path.$filename;

    if(!is_dir($root.$path))  mkdir($root.$path,0777,true);
    file_put_contents($fullPath,$image);
    //修改歌曲信息

    $audio = new  AudioUtils();
    $pa = array('Title' => 'yanxiu.com', 'AlbumTitle' => 'yanxiu','Artist'=>'yanxiu','author'=>'yanxiu','APIC'=>'');
    $audio->SetInfo($fullPath, $pa);
    //生成url 路径
    $host = $STATIC_CDN_URL;
    $newUrl = $host.'/'.$path.$filename;
    return $newUrl;
}
