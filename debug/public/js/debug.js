
WS_STATUS={
    init:10,
    connect:0,
    open:1,
    error:2,
    close:3,
    authsucc:5,
    authfail:6
}

function setWsStatus(status,msg)
{
    if(!msg)  msg='';
    switch (status)
    {
        case WS_STATUS.init:
            html = '<span style="color:green">未初始化</span>';
            console.log(html)
            $('.ws_status').html( html );
            break;
        case WS_STATUS.connect:
            html = '<span style="color:green">正在连接</span>';
            $('.ws_status').html( html );
            break;
        case WS_STATUS.open:
            html = '<span style="color:green">连接成功</span>';
            $('.ws_status').html( html );
            break;
        case WS_STATUS.close:
            html = '<span style="color:black">关闭</span>';
            $('.ws_status').html( html );
            break;
        case WS_STATUS.error:
            html = '<span style="color:red">出错'+msg+'</span>';
            $('.ws_status').html( html );
            break;
        case WS_STATUS.authsucc:
            html = '<span style="color:green">授权成功，开始接收日志。</span>';
            $('.ws_status').html( html );
            break;
        case WS_STATUS.authfail:
            html = '<span style="color:red">授权失败'+msg+'</span>';
            $('.ws_status').html( html );
            break;
        default: console.log('WS_STATUS没有这个状态');
    }
}

setWsStatus(WS_STATUS.init)

//消息组
var chatGroup  = [];
window.token = '';
var chat = null;
var flag_stop = false;

function  Chat(server,callback) {
    this.server = server;
    this.is_connect = false;

    this.ws = null;
    //初始化 -- 握手成功后发送令牌数据
    this.connect = function ()
    {
        console.log(this.server)
        this.ws = new WebSocket(this.server);
        _this =this;
        this.ws.onopen = function(){
            console.log("ws 握手成功");
            setWsStatus(WS_STATUS.open)
            _this.is_connect = true;
            _this.send(window.token , 'token');
        }

        this.ws.onmessage =this.onmessage;

        this.ws.onerror = function(response ,errno){
            _this.close()
            setWsStatus(WS_STATUS.error)
        }
    }

    /****
     *  发送消息
     * @param centent  消息内容
     * @param type     消息类型 警告 错误 token。。。
     * @param group    消息分组  可进修对比
     */
    this.send= function (centent , type , group) {
        var  data = {};
        type    ? data.type    = type : data.type = 'info';
        group ? data.group = type : data.group ='';
        if(typeof centent =="array"||typeof centent == 'object')
            data.contentType = 'json';
        else
            data.contentType = 'text';
        data.data = centent;
        this.ws.send( JSON.stringify( data) );
    }

    //接收消息
    this.onmessage = function (event) {
        //console.log("message:" + event.data);
        callback(event.data ,this);
    }

    this.close = function(){
        if(this.ws)
        {
            this.ws.close();
            this.is_connect= false;
            this.ws = null;
        }
    }
}

/***
 *  有新的消息到来的函数 ..
 */
function  onMessage(msg , chat)
{
    var  frame = JSON.parse(msg);
    console.log(frame);
    if(frame.type=='sys')
    {
        if(frame.msg == '认证成功')
        {
            setWsStatus(WS_STATUS.authsucc)
            chat.is_connect = true;
        }else{
            setWsStatus(WS_STATUS.authfail , frame.msg)
            // 重置按钮状态
            $('#btn_start').text('开始').removeClass('stop').addClass('start');
            // 重置接受消息状态
            flag_stop = false;
            //关闭连接
            chat.close();
        }
        return;
    }

    //
    if(flag_stop)  return;

     frame.data = frame.data ? frame.data : '';
    if(!filterFrame(frame.data))
    {
         console.log( 'filter frame:',frame.data );
        return ;
    }

    if( !chatGroup[frame.group] ) chatGroup[frame.group] = [];

    chatGroup[frame.group].push(frame);
    var  tpl = '';
    switch (frame.type)
    {
        case 'info'   : tpl=  "<p class='info'  group='"+frame.group+"'>{0}</p>"  ;  break;
        case 'error'  : tpl=  "<p class='error' group='"+frame.group+"'>{0}</p>"  ;  break;
        case 'waring' : tpl=  "<p class='waring' group='"+frame.group+"'>{0}</p>"  ;  break;
        default:        tpl = "<p class='info'  group='"+frame.group+"'>{0}</p>"  ;  break;
    }

    var  time = new Date();
    var  timestr = time.getHours()+"-"+time.getMinutes()+"-"+time.getSeconds();
    var  span_id = "log_"+timestr+'-'+time.getMilliseconds();
    var  tpl2 = "<small>"+timestr +" :</small><span id='"+span_id+"'>{0}</span>";

    if(frame.contentType=='json')
    {
        var tpl = tpl.format(tpl2.format('')) ;
        $('.logger_container').first().prepend( tpl  )
        var json = JSON.parse( frame.data );
        $('#'+span_id).JSONView(json ,{ collapsed: true});

    }else{
        tpl2 =tpl2.format(frame.data);
        $('.logger_container').first().prepend(  tpl.format(tpl2) )
    }
    //console.log( str );
    var  container  = $('.logger_container')[0];// console.log(containers);
    $(container).scrollTop( container.scrollHeight-container.offsetHeight +80);
}

// 在移动设备上默认隐藏对比栏
if(!IsPC())
{
    //$('#compare_hide').click();
}

// 过滤
function filterFrame(data)
{
    if($('#input_filter_word_flag')[0].checked)
    {
        var filter_word = $('#input_filter_word').val();
        if(data.indexOf(filter_word)!=-1)
        return false
    }
    if($('#input_need_word_flag')[0].checked)
    {
        var need_word = $('#input_need_word').val();
        if(data.indexOf(need_word)==-1)
        return false;
    }
    return true;
}

/***
 * 控制连接到服务器
 * @param ele  控制元素
 */
function toggle_connect(ele)
{
    //   console.log('connectToServer()')
    if( $(ele).hasClass('start'))
    {
        flag_stop = false;
        $(ele).text('关闭连接').removeClass('start').addClass('stop');
        if(chat&&chat.is_connect)
            chat.close();
        window.token = $('#input_token').val();
        var  host = $('#input_server_addr').val();
        var  port = $('#input_server_port').val();
        host = host?host:window.location.host;
        var  ServerURL= 'ws://'+host+':'+port;

        setCurrentHost( ServerURL+"@"+token )
        chat = new Chat ( ServerURL , onMessage );
        chat.connect();
    }else{
        flag_stop = true;
        $(ele).text('连接').removeClass('stop').addClass('start');
    }
}

/***
 * 控制开始和结束
 * @param ele
 */
function  toggle_start_stop(ele)
{
    if( $(ele).hasClass('start'))
    {
        if(chat&&chat.is_connect)
        {
            flag_stop = false;
            $(ele).text('暂停').removeClass('start').addClass('stop');
        }
    }else{
        flag_stop = true;
        $(ele).text('开始').removeClass('stop').addClass('start');
    }
}

function  connectToServer(ele,reconnect)
{
    //   console.log('connectToServer()')
        window.token = $('#input_token').val();
        var  host = $('#input_server_addr').val();
        var  port = $('#input_server_port').val();
        host = host?host:window.location.host;
        var  ServerURL= 'ws://'+host+':'+port;
        console.log(ServerURL);
        setCurrentHost(ServerURL+"@"+token)
        chat = new Chat ( ServerURL , onMessage );
        chat.connect();
}

function closeServer()
{
    chat.close();
}

function  setCurrentHost(info)
{
  $('#current_info').text(info);
}


//筛选指定的消息
function  showMsgType(type) {
    if(type=='all')  $("p").show();

    switch (type) {
        case 'info' :
            $("p.waring").hide();$("p.info").show();$("p.error").hide();
            break;
        case 'error' :
            $("p.waring").hide();$("p.info").hide();$("p.error").show();
            break;
        case 'waring' :
            $("p.waring").show();$("p.info").hide();$("p.error").hide();
            break;
    }
}

function chooseGroup() {
    // console.log(this);
    var group = this.innerText;
    //console.log(group);
    //console.log(chatGroup[group]);
    $(this).parent().children().removeClass('current');
    $(this).addClass('current');

    var list = chatGroup[group];
    var msg_container = $(this).parent().parent().parent().find('.msg_container');
    msg_container.empty();

    for (var  i in list)
    {
        console.log(list[i])
        msg_container.append('<p class="'+list[i].type+'"  group="'+group+'" >'+list[i].data+'</p>');
    }
};
//
function showGroup(group,ele) {
    return true;
//        console.log(group);
//        console.log(chatGroup[group]);
//        var list = chatGroup[group];
//        var msg_container = $('.msg_container');
//        msg_container.empty();
//        console.log(ele)
//        for (var  i in list)
//        {
//            console.log(list[i])
//            msg_container.append('<p class="'+list[i].type+'"  group="'+group+'" >'+list[i].data+'</p>');
//        }
}


