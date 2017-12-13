/**
* wzb 2017-1-6
*/
var cid = 0;
var sort = 0;
var bid = 0;
var p = 1;

$(function () {
// 客服帮助
$('#faq-box .item .question').click(function() {
var item_p = $(this).parents(".item");
item_p.toggleClass("active");
window.scrollTo(0,document.body.scrollHeight);
})
})


//Ajax 请求 json post
function postJson(url,data,successFunc,errorFunc){
    var data = data || "{}";
    successFunc = successFunc || null;
    errorFunc = errorFunc || null;
    if(!url || url==='#')
    return false;

    $.ajax({
        type: 'POST',
        url: url,
        data:data,
        dataType: 'json',
        success: function(data) {
        try{ successFunc(data); }catch(e){}
        },
        error: function(xhr, type) {
        try{ errorFunc(data); }catch(e){}
        console.log("页面动态加载不成功，请与管理员联系");
        },
    })
    //阻止冒泡
    return false;
}

//Ajax 请求 获取原始数据
function postPage(url,data,successFunc,errorFunc){
    var data = data || "{}";
    successFunc = successFunc || null;
    errorFunc = errorFunc || null;
    if(!url || url==='#')
    return false;

    $.ajax({
        type: 'POST',
        url: url,
        data:data,
        success: function(data) {
            try{ successFunc(data); }catch(e){}
        },
        error: function(xhr, type) {
            try{ errorFunc(data); }catch(e){}
            console.log("页面动态加载不成功，请与管理员联系");
        },
    })
    //阻止冒泡
    return false;
}


function postJsonp(url, myFun)
{
    $.ajax({
        type : "GET",
        url : urlParams(url,'ajax_request=1&ajax=1&date='+Math.random()),
        dataType : "jsonp",
        jsonp: 'CALLBACK',
        success : function(json){
         myFun(json);
        }
    });
}

function postForm(form, url, myFun)
{
    $.ajax({
        type : "POST",
        url : urlParams(url,'ajax_request=1&ajax=1&date'+Math.random()),
        data: $('#'+form).serialize(),
        dataType : "jsonp",
        jsonp: 'CALLBACK',
        success : function(json){
             myFun(json);
        },
        error: function(XMLHttpRequest,textStatus,errorThrown){
        alert(XMLHttpRequest.status);
        alert(XMLHttpRequest.readyState);
        alert(textStatus);
        }
    });
}


// 页面提示信息
function bh_msg_tips(msg){
    var oMask = document.createElement("div");
    oMask.id = "bh_msg_lay";
    oMask.style.position="fixed";
    oMask.style.left="0";
    oMask.style.top="70%";
    oMask.style.zIndex="100";
    oMask.style.textAlign="center";
    oMask.style.width="100%";
    oMask.innerHTML =  "<span style='background: rgba(0, 0, 0, 0.65);color: #fff;padding: 10px 15px;border-radius: 3px; font-size: 14px;'>" + msg + "</span>";
    document.body.appendChild(oMask);
    setTimeout(function(){$("#bh_msg_lay").remove();},2000);
}


/**********************************
* return top
**********************************/
// 页面加载执行
window.onload = function() {
return_top();
}

function return_top(){
var obtn = document.getElementById('icon-top');
try{
//获取页面可视区的高度
// <!doctype html> 必须要有值clientHeight才有用
var clientHeight = document.documentElement.clientHeight;
var timer = null;
var isTop = true;
var osTop = document.documentElement.scrollTop || document.body.scrollTop;
if (osTop >= clientHeight) {
obtn.style.display = "block";
} else {
obtn.style.display = "none";
};
// 滚动条滚动时触发
window.onscroll = function() {
var osTop = document.documentElement.scrollTop || document.body.scrollTop;
if (osTop >= (clientHeight/2)) {
obtn.style.display = "block";
} else {
obtn.style.display = "none";
};
if (!isTop) {
clearInterval(timer);
};
isTop = false;
}
obtn.onclick = function() {
document.documentElement.scrollTop = document.body.scrollTop = 0;
////设置定时器
//timer = setInterval(function() {
//    //获取滚动条距离顶部的高度
//    var osTop = document.documentElement.scrollTop || document.body.scrollTop;
//    var ispeed = Math.floor(-osTop / 6);
//    document.documentElement.scrollTop = document.body.scrollTop = osTop + ispeed;
//
//    isTop = true;
//    if (osTop == 0) {
//        clearInterval(timer);
//    }
//}, 200);
}
}catch(e){ return false; }

}
// 去除url 里的 .html
function delAspExtension(str){
var reg = /\.html$/;
return str.replace(reg,'');
}

// 倒计时
function GetRTime(dateid){
    if( !document.getElementById(dateid) )
    {
    console.log(dateid+'is not ok');
    return ;
    }
    var startdate = document.getElementById(dateid).getAttribute("startdate");
    var EndTime= new Date(startdate);
    var NowTime = new Date();
    var t =EndTime.getTime() - NowTime.getTime();
    var d=0;
    var h=0;
    var m=0;
    var s=0;
    if(t>=0){
    d=Math.floor(t/1000/60/60/24);
    h=Math.floor(t/1000/60/60%24);
    m=Math.floor(t/1000/60%60);
    s=Math.floor(t/1000%60);
    }
    if(d>0){
    var timehtml = "倒计时: "+d +"天 <i class='num'>"+h+"</i> <small>:</small> <i class='num'>"+m+"</i> <small>:</small> <i class='num'>"+s+"</i>";
    }else{
    var timehtml = "倒计时: <i class='num'>"+h+"</i> <small>:</small> <i class='num'>"+m+"</i> <small>:</small> <i class='num'>"+s+"</i>";
    }
    document.getElementById(dateid).innerHTML = timehtml;
}

// 搜索页搜索
function key_search_list(){
var key_v = $('#search_keyword').val();
if(key_v == ''){
return false;
}
var url = "/Book/ajax_search";
var data = {key:key_v,p:1}
$("#bhloading").show();
AjaxJson(url,data,function(data){
if(data.status*1 == 1){
$('#page_html').html(data.data);
$('#show_cleare_btn').show();
$('#show_sear_btn').hide();
}else{
bh_msg_tips(data.info);
}
$("#bhloading").hide();
})
}

// 实时搜索
function keyup_search(obj,type){
    $('#show_cleare_btn').hide();
    $('#show_sear_btn').show();
    $('#closeid').show();
    return false;
    var key_v = $(obj).val();
    if( parseInt(key_v.length) >0  ){
    $("#page_html").empty();
    var url = "/modules/article/search.php";
    var data = {searchkey:key_v,type:type}
    AjaxJson(url,data,function(data){
    if(data.status*1 == 1){
    if(data.data != ''){
    $("#page_html").html(data.data);
    $('#show_cleare_btn').hide();
    $('#show_sear_btn').show();
    }
    }
    })
    }
}

// 清除输入框的文字
function close_clear(){
$('#closeid').hide();
$('#search_keyword').val('');
$('#show_cleare_btn').show();
$('#show_sear_btn').hide();
}

//首页显示搜索框
function show_ser_box(){
$("#show_ser_box").show();
}
//首页隐藏搜索框
function hide_ser_box(){
$("#show_ser_box").hide();
$("#search_keyword").val("");
close_clear();
}
//首页点击搜索跳转到搜索页面
// 搜索页搜索
function key_search_href() {
var key_v = $('#search_keyword').val();
if (key_v == '') {
return false;
}
hide_ser_box();
window.location.href = "/modules/article/search.php?searchkey="+key_v;
}

// 列表分页获取
var autoready=1;
function list_page(url,data,no,id){
    $(window).bind("scroll", function (event) {
    //滚动条到网页头部的 高度，兼容ie,ff,chrome
    var top = document.documentElement.scrollTop + document.body.scrollTop;
    var textheight = $(document).height();  //网页的高度
    // 网页高度-top-当前窗口高度
    if (textheight - top - $(window).height() <= 60){
    if(autoready==1) {
    autoready=0;
    //              window.scrollTo(0,document.body.scrollHeight);
    // 请求分页数据
    get_page_data(url,data,no,id);
    }
    }
    });
}
// 请求分页数据
function get_page_data(url,data,no,id){
    var box_id = id || '#html_box';
    p = data['p'];
    $("#bhloading").show();
    AjaxJson(url,data,function(res){
    if(res.status*1 == 1){
    p++;
    $(box_id).append(res.data);
    data['p'] = p;
    autoready=1;
    }else{
    if(no != 'no'){
    bh_msg_tips(res.info);
    }
    }
    $("#bhloading").hide();
    })
}
