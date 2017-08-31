
String.prototype.format = function () {
    var result = this;

    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (arguments) == "object") {

            arguments = arguments[0];
            for (var key in arguments) {
                if(arguments[key]!=undefined){
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, arguments[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({[" + i + "]})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;

}

//var newDate = new Date();
//console.log(newDate.format('yyyy-MM-dd h:m:s'));
Date.prototype.format = function(format) {
    var date = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
}

//弹出层
jQuery.extend(
    {
        waring:function(content) {
            layer.open({
                title: '警告',
                area: ['500px'],
                offset: [ '150px'],
                content:  "<div class='col-sm-8 col-sm-offset-1'>"+content+"</div>",
                icon:0,
                btn: ['确定',],
                closeBtn:1,
                shade:[0.9,'#000'],
                anim:6,
                resize:false
            });
        },
        error:function(content) {
            layer.open({
                title: '错误',
                area: ['500px'],
                offset: [ '150px'],
                content:  "<div class='col-sm-8 col-sm-offset-1'>"+content+"</div>",
                icon:2,
                btn: ['确定',],
                closeBtn:1,
                shade:[0.9,'#000'],
                anim:6,
                resize:false
            });
        },
        alert:function(content ,title) {
            if(title==undefined) title= '消息';
            layer.open({
                title: title,
                area: ['500px'],
                offset: [ '150px'],
                content:  "<div class='col-sm-8 col-sm-offset-1'>"+content+"</div>",
                icon:1,
                closeBtn:false,
                btn: ['确定',],
                shade:[0.2,'#000'],
                anim:0,
                resize:false
            });
        },
        loading:function () {
            return layer.load(0, { shade: [0.1,'#3e3e3e'] , time: 10*1000});
        },
        closeLoading:function (e) {
            setTimeout(function () { layer.close(e); },100);
        },
        parseFormAsJson:function (element) {
            var  formData = $(element).serializeArray();
            var data={};
            for(var index in formData)
            {
                data[formData[index]['name']] = formData[index]['value'];
            }
            return data;
        }
    });

//$.loading();
//$.waring('输入有误!!');
//$.alert('消息');

/**
var  config = {
    currentPage: 1,
    sum:99,
    pagesize:10,
    onclick:call,
    container:"#frame-article-list .pagination",
};
 pagination(config);
 */
function  pagination( config ) {
    //console.log($(config.container))
    var  element= $(config.container);
    element.prop('data-init',true);
    var sum = config.sum;
    var  pagesize = config.pagesize;
    var  pageNum  = parseInt( (sum-1)/pagesize+1 );
    var  currentPage =config.currentPage;
    window.currentPage  = currentPage;
    element.empty();

    var first = '<li><a href="#">&laquo;</a></li>';
    var last = '<li><a href="#">&raquo;</a></li>';
    var firstNode = $(first);
    firstNode.click(config.onclick);
    element.append(firstNode);

    var lastNode = $(last);
    lastNode.click(config.onclick);
    element.append(lastNode);

    var item = "<li><a href='#'>{0}</a></li>";
    for(var  i=currentPage ;i<currentPage+10&&i<=pageNum ;i++ )
    {
        var liNode = item.format(i);
        var last = element.children('li').last();
        var wrap = $(liNode);
        wrap.insertBefore(last);
        wrap.click(config.onclick);
        if(i==currentPage)
            wrap.addClass('currentPage');
    }

}

/**
 *  更新数据列表
 * */
function  updateList(element ,data ,callback )
{
    var  container = $(element);
    var item = "<li>  <a  _href='{0}'> {1} </a> </li>";

    data.forEach(function (value) {
        //console.log(value)
        var liNode = item.format(value.href, value.title);
        // console.log(liNode)
        container.append(liNode);
        container.find("li").last().click(callback);
    });
}

// var config = {
//     template:"<li><a  _href='{url}'>{title}</a></li>",
//     keys:['url','title'],
//     element:'#frame-video-list .lis_1 ul',
//     data:[ {url:'/123',title:'tile0'},{url:'/123',title:'tile1'},{url:'/123',title:'tile2'} ],
//     callback:succesTip,
// };
function  updateListTemplate( config )
{
    var  container = $(config.element);
    var item = config.template;
    container.empty();
    if( Array.isArray(config.data) )
    {
        config.data.forEach(function (value,pos) {
            var keys = config.keys;
            var  liNode = config.template;
            for ( var index in keys )
            {

                var reg = new RegExp("({" + keys[index] + "})", "g");
                liNode = liNode.replace(reg, value[ keys[index] ]);
            }
            liNode = liNode.replace("{index}",pos+1);
            //console.log(liNode)
            container.append(liNode);
            container.children().last().click(config.callback);
        });

    }else{
        console.log("列表缺少数据"); return;
    }

}

//updateListTemplate(config);

//var data = [{href:'/123',title:'tile'}, {href:'/123',title:'tile'},];
//updateList('#frame-video-list ul' ,data , call);


/****
 * 更新 select2 控件的数据
 * @param element
 * @param items
 * @param title    数据的 option-title   下标
 * @param value  数据的  option-value 值下标
 */
function  updateSelect2Data(element, items, title , value)
{
    typeof (title)=='undefined' ? title='name' : '';
    typeof (value)=='undefined' ? value ='id':'';
    console.log(title);
    var str;
    $(element).empty();
    for (var  i  in items)
    {
        str = "<option value="+items[i][value]+">"+items[i][title]+"</option>";
        $(element).append(str);
    }
}

String.prototype.firstUpperCase=function(){
    return this.replace(/^\S/,function(s){return s.toUpperCase();});
}

/**
 * // var a = "我喜欢吃{0}，也喜欢吃{1}，但是最喜欢的还是{0},偶尔再买点{2}";
 * // alert(String.format(a, "苹果","香蕉","香梨"));
 * */
var sprintf = function() {
    if (arguments.length == 0)
        return null;
    var str = arguments[0];
    for ( var i = 1; i < arguments.length; i++) {
        var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        str = str.replace(re, arguments[i]);
    }
    return str;
};

/*****
 *  从服务器获取数据
 * @param url     请求网址
 * @param element   jq选择器
 * @param data    请求参数 json格式
 * @param title          服务端返回
 * @param value       服务端返回
 */
function  requestData(url,element, data, title , value)
{
    typeof (data) == 'undefined' ? data={} : '';
    $.ajax({
        url:url,
        data:data,
        dataType:'json',
        type:'get',
        success:function (items) {
            //console.log( items );
            if(typeof(items)=='object'||typeof(items)=='array')
            {
                updateSelect2Data(element,items,title,value);
            }
        },
        error:function () {
            alert(url+"not found");
        }
    });
}

function  parse( ) {
    var data = $("#search").serialize();
    $.ajax({
        url:'search',
        data:data,
        dataType:'json',
        type:'get',
        success:function (items) {
            console.log( items );
            if(typeof(items)=='object'||typeof(items)=='array')
            {
                //updateSelect2Data(element,items,title,value);
            }
        },
        error:function () {
            alert('error');
        }
    });
}
function isArray(o){
    return Object.prototype.toString.call(o)=='[object Array]';
}
//将数据填写到 select 元素中
function  fillSelect(  data  , selectEle ) {

    if(!selectEle)  return;
    if(  selectEle instanceof jQuery)
    {
        selectEle = selectEle[0];
    }
    $(selectEle).empty();
    //selectEle.options.add( new Option( '请选择' , 0 ) );
    if(isArray(data))
    {
        data.forEach( function ( val , index ,next) {
            selectEle.options.add( new Option( val.title , val.value ) );
        });
    }else
    {
        for(var key in data)
        {
            if(typeof data[key] =='object')
             selectEle.options.add( new Option( key , key   ) );
                else
             selectEle.options.add( new Option( data[key] , key   ) );
        }
    }
}

/***
 *  从url参数中 填充form 表单
 * @param formId
 */
function initForm( formId ) {
    var query = window.location.href;
    if(query.indexOf('?')!==-1)
        query =query.substr(query.indexOf('?')+1);
    var params = query.split('&')
    var fromData = {};
    for (var i in params)
    {
        var  param = params[i].split('=')
        fromData[param[0]] = param[1];
    }

    for (var i in fromData)
    {
        $('#'+formId+' [name="'+i+'"]').val( decodeURI(fromData[i]) )
    }
}

/***
 * 更新 frmae 的页面
 * @param url
 */
function  openFrameUrl(url) {
    win = window.top
    win.location.hash = url
    win.frames['pageFrame'].location.href = url;
}

/***
 * 级联筛选器
 * @param config
 * @constructor
 *     var config = {
     *       'firstData' : data,                             初始化数据
     *       'selector'  : "#select_chapter",       包含select组的容器
     *      'serverUrl' : '/chapter/get-chapter-sons',  获取数据的接口
     *  };
 */
function  CascadeSelect( config ) {


    //创建一个新的选择节点
    function  makeSelect(lvl) {
        if(  ! ( lvl=parseInt(lvl) )  )  { console.log(lvl+" cant convert to int ") ; return; }
        var select =  document.createElement('select');
        select.setAttribute("data-lvl" ,lvl );
        select.className = 'select2-selection--single';
        return select;
    }
    //console.log($ ( config.selector ));
    // 缓冲10 个选项框
    for( var i = 1 ;i<10 ;i++  )
    {
        var  selectElement = makeSelect(i);
        $ ( config.selector )[0].appendChild( selectElement );
    }

    //显示一个初始化的数据
    var  selectElements  =  $( config.selector ).children();
    console.log(  $( config.selector ) )
    fillSelect( config.firstData  , selectElements[0] );

    //隐藏多余选项
    $(selectElements[0]).nextAll().hide();
    //点击获取下级内容
    $( config.selector ).on('change','select',function(){
        var   val =  $(this).val() , lvl = $(this).attr('lvl');
        var  _this = this;
        $(_this).nextAll().hide();
        if(val==0) return;   // 未选择情况子类 , 直接返回
        $.ajax({
            url : config.serverUrl ,
            data:{ parentid : val },
            dataType: "json",
            success:function (response) {
                if(response.status && response.data.length>0)
                {
                    var  next = $(_this).next();
                    if(next.length == 0)  return;
                    fillSelect( response.data ,next[0] );
                    next.show();
                }else{

                }
            },
            error: function () {
                alert("获取子章节失败 网络问题");
            }
        });
    });
}


var showMessage = function(type, message, duration) {
    var $exist = $('.bootstrap-notify-bar');
    if ($exist.length > 0) {
        $exist.remove();
    }

    var html = '<div class="alert alert-' + type + ' bootstrap-notify-bar" style="display:none;">'
    html += '<button type="button" class="close" data-dismiss="alert">×</button>';
    html += message;
    html += '</div>';

    var $html = $(html);
    $html.appendTo('body');

    $html.slideDown(100, function(){
        duration = $.type(duration) == 'undefined' ? 3 :  duration;
        if (duration > 0) {
            setTimeout(function(){
                $html.remove();
            }, duration * 1000);
        }
    });

}
var Notify = {
    primary: function(message, duration) {
        showMessage('primary', message, duration);
    },

    success: function(message, duration) {
        showMessage('success', message, duration);
    },

    warning: function(message, duration) {
        showMessage('warning', message, duration);
    },

    danger: function(message, duration) {
        showMessage('danger', message, duration);
    },

    info: function(message, duration) {
        showMessage('info', message, duration);
    }
};
function bind_modal_loading() {
    $(document).on('click','[data-toggle="modal"]', function(e) {
        var $this = $(this),
            href = $this.attr('href'),
            url = $(this).data('url');
        imgUrl = "/images/loading.gif";
        if (url) {
            var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, '')));
            var $loadingImg="<img src='"+imgUrl+"' class='modal-loading' style='z-index:1041;width:60px;height:60px;position:absolute;top:50%;left:50%;margin-left:-30px;margin-top:-30px;'/>";
            $target.html($loadingImg);
            $target.load(url);
            $target.modal('show');
        }
    });
}

function show_modal(url) {
    imgUrl = "/images/loading.gif";
    if (url) {
        var $target = $('#modal');
        var $loadingImg="<img src='"+imgUrl+"' class='modal-loading' style='z-index:1041;width:60px;height:60px;position:absolute;top:50%;left:50%;margin-left:-30px;margin-top:-30px;'/>";
        $target.html($loadingImg);
        $target.load(url);
        $target.modal('show');
    }
}

// 获取git 查询参数
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

function convertNumber(number) {
    var number_list = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十"];
    return number_list[number];
}

/**
 * 构建无限级联动选择面板
 */
var SelectPanel = {
    _init : function (url, params, suburl, li_width, ul) {
        var ul = ul || '.list';
        var firstul = $(ul + ':eq(0)').html();
        if(firstul != '')
        {
            var selected_pid = $(ul + ':eq(0) li.selected').attr('pid');
            $(ul + ':eq(0)').html('');
        }

        $.get(url,params,function(result) {

            var obj = $.parseJSON(result);
            var selected = 0;
            for(var i in obj){
                var li = $('<li>');
                var name = obj[i].name;
                li.attr({'title': name, 'alt': name, 'pid': obj[i].id});
                li.html(name);
                if(isNaN(selected_pid) == false && selected_pid == obj[i].id){
                    selected++;
                    li.addClass('selected');
                }
                $(ul + ':eq(0)').append(li);
            }
            selected == 0 && $(ul).parent().find('ul:gt(0)').remove();

            SelectPanel._getChildrenByParent($(ul + ':eq(0) li'), suburl, li_width);

        });
    },
    /**
     * 获取下级
     */
    _getChildrenByParent : function (li, suburl, li_width) {
        li.click(function () {
            var pid = $(this).attr('pid');
            var li = $(this);
            SelectPanel._toggleList(li);

            $.get(suburl, {'parent_id': pid}, function (result) {
                var obj = $.parseJSON(result);

                var html = $('<ul>');
                html.addClass('list');
                for (var i in obj){
                    var id = obj[i].id;
                    var name = obj[i].name;
                    var checkbox = '';
                    var rgt = parseInt(obj[i].rgt);
                    var lft = parseInt(obj[i].lft);
                    var diff = rgt - lft;
                    var checkbox = '';
                    if(diff == 1){
                        checkbox = $('<input>');
                        checkbox.attr({'type': 'checkbox', 'name': 'ids[]'});
                        checkbox.val(id);
                    }
                    var litmp = $('<li>');
                    litmp.attr({'title': name, 'alt': name, 'pid': id});
                    litmp.append(checkbox);
                    litmp.append(name);
                    litmp.click(function () {
                        SelectPanel._toggleList(this);
                    }).find('input').click(function () {
                        $(this).prop('checked', $(this).is(':checked') ? false : true);
                    });
                    html.append(litmp);
                }

                var next = li.parent('ul').nextAll();
                next.html() != undefined && next.remove();
                li.parent('ul').after(html);

                $(li).parent().parent().find('ul').each(function(k){
                    $(this).css('left', k * li_width + 'px');
                });

                var next_li = li.parent('ul').next().find('li:not(:has(input))');
                SelectPanel._getChildrenByParent(next_li, suburl, li_width);
            });
        }).find('input').click(function () {
            $(this).prop('checked', $(this).is(':checked') ? false : true);
        });
    },

    /**
     * 列表样式切换和checkbox点击事件
     */
    _toggleList : function (li) {
        $(li).addClass('selected').siblings().removeClass('selected');
        var ipt = $(li).find('input');
        ipt.prop('checked', ipt.is(':checked') ? false : true);
    }
}



/**
 * 生成知识点联动选择器
 * @param term_id
 * @param subject_id
 */
function createPointSelector(term_id, subject_id) {
    $.get("/chapter-point/get-points-by-term-and-subject",{'term_id':term_id,'subject_id':subject_id,'type':'text'},function(result){
        var data = $.parseJSON(result);
        $(".point-modal #lvl1_id").children().remove();
        $(".point-modal #lvl1_id").select2({
            data: data,
        }).val('0').parent().parent().nextAll('.sub-point').remove();
        $('#select2-lvl1_id-container').attr('title', '请选择').html('请选择');

    });

    /**
     * 点击lvl-1获取lvl-2
     */
    $('.point-modal #lvl1_id').unbind('change').change(function () {
        var lvl1_id = $('#lvl1_id').val();
        getPointsByParent($(this));

    });

    /**
     * 获取子知识点
     */
    function getPointsByParent(parent){
        var parent_id = parent.val();
        $.get("/chapter-point/get-points-by-parent",{'parent_id':parent_id,'type':'text'},function(result){
            var parent_wrap = parent.parent().parent();
            //var data = [{'id':'0', 'text':'请选择'}];
            var data = $.parseJSON(result);
            parent_wrap.nextAll('.sub-point').remove();
            if(!parent_id || $.isEmptyObject(data)){
                return;
            }
            var count = parent_wrap.parent().find('.sub-point').size();
            var depth = count + 2;

            var wrap = $('<div class="col-md-2 sub-point padding-right-10"><div class="form-group"><label for="field-5" class="control-label">' + depth + '级知识点</label><select class="form-control selector"><option value="0">请选择</option></select></div></div>');

            parent_wrap.nextAll('.sub-point').remove();
            parent_wrap.after(wrap);
            wrap.find('.selector').select2({
                data: data
            }).change(function () {
                getPointsByParent($(this));
            });


        });
    }
}

/**
 * 生成章节联动选择器
 * @param term_id
 * @param subject_id
 */
function createChapterSelector(term_id, subject_id) {
    $.get("/chapter/get-editions-by-term-and-subject",{'term_id':term_id,'subject_id':subject_id,'type':'text'},function(result){
        var data = $.parseJSON(result);
        $(".chapter-modal #lvl1_id").children().remove();
        $(".chapter-modal #lvl1_id").select2({
            data: data,
        }).val('0').parent().parent().nextAll('.sub-chapter').remove();
        $('.chapter-modal #select2-lvl1_id-container').attr('title', '请选择').html('请选择');

    });

    /**
     * 点击lvl-1获取lvl-2
     */
    $('.chapter-modal #lvl1_id').unbind('change').change(function () {
        var lvl1_id = $('.chapter-modal #lvl1_id').val();
        getChaptersByParent($(this));

    });

    /**
     * 获取子知识点
     */
    function getChaptersByParent(parent){
        var parent_id = parent.val();
        $.get("/chapter/get-chapter-by-parent",{'parent_id':parent_id,'type':'text'},function(result){
            var parent_wrap = parent.parent().parent();
            parent_wrap.nextAll('.sub-chapter').remove();
            if(!parent_id || $.isEmptyObject(result)){
                return;
            }
            var count = parent_wrap.parent().find('.sub-chapter').size();
            var depth = count + 2;
//console.log(result);
            var wrap = $('<div class="col-md-2 sub-chapter padding-right-10"><div class="form-group"><label for="field-5" class="control-label">' + depth + '级</label><select class="form-control selector"><option value="0">请选择</option></select></div></div>');

            parent_wrap.nextAll('.sub-chapter').remove();
            parent_wrap.after(wrap);
            wrap.find('.selector').select2({
                data: result
            }).change(function () {
                getChaptersByParent($(this));
            });


        });
    }
}

function clearForm(objE){
    $(objE).find(':input').each(
        function(){
            switch(this.type){
                case 'passsword':
                case 'select-multiple':
                case 'select-one':
                case 'text':
                case 'textarea':
                    $(this).val('');
                    break;
                case 'checkbox':
                case 'radio':
                    this.checked = false;
            }
        }
    );
}



/**
 * 用户选择弹出层
 *
 * @param placeholder $placeholder
 * @access public
 * @return void
 */
function getRemoteSelectOptions(action,placeholder)
{
    return {
        allowClear: true,
        escapeMarkup: function (markup) { return markup; },
        templateSelection: function(item) {
            return item.text;
        },
        templateResult: function(item) {
            return item.text;
        },
        minimumInputLength: 2,
        placeholder: placeholder,
        width: '200px',
        ajax: {
            url: action,
            dataType: 'json',
            quietMillis: 100,
            data: function (params) {
                return {
                    q: params.term,
                    page: params.page,
                    page_limit: 10,
                };
            },
            results: function (data) {
                var results = [];
                $.each(data, function(index, item){
                    results.push({
                        id: item.id,
                        text: item.text,
                    });
                });
                return {
                    results: results
                };
            }
        },
    };

}

/**
 * getAbilityBySubject 根据学科获取能力层次
 *
 * @access public
 * @return void
 */
function getAbilityBySubject(subject_id,abilities) {
    var result = {};
    if(subject_id == 1104) {
        //听说读写
        for(var i in abilities) {
            if(i >= 2505) {
                result[i] = abilities[i];
            }
        }
    }else{
        for(var i in abilities) {
            if(i < 2505) {
                result[i] = abilities[i];
            }
        }
    }
    return result;
}

function showPointModal(obj, flag) {
    var flag = flag || '';
    var term_id = $('#term_id').val();
    var subject_id = $('#subject_id').val();
    if(!term_id || !subject_id){
        Notify.danger('请先选择学科和学段');
        return;
    }
    $('#modal-6').modal('show', {backdrop: 'static'});

    createPointSelector(term_id, subject_id);
    var now_val = $(obj).next().val();
    $(".point-modal #point-input").val(now_val);
    if(now_val != '') getPointByIds(now_val);
    else $('.point-modal #point-container').html('');

    $('.point-modal .point-add').unbind('click').click(function () {
        var val = num = 0;
        $('.point-modal select').each(function () {
            var tval = $(this).val();
            if($(this).find('option').size() > 1){
                if(tval == '0')
                    num++;
                else
                    val = tval;
            }
        });

        if(num > 0){
            Notify.danger('请选择');
            return;
        }

        var ipt_val = $(".point-modal #point-input").val();
        var ipt_val_arr = [];
        if(ipt_val != ''){
            ipt_val_arr = ipt_val.split(',');
        }

        if(ipt_val_arr.indexOf(val) < 0) {
            if($.isNumeric(val)) {
                ipt_val += ',' + val;
            }
        }
        else{
            Notify.danger('重复添加, 请重新选择');
            return;
        }

        ipt_val = ipt_val.replace(/^,/, '');
        $(".point-modal #point-input").val(ipt_val);
        getPointByIds(ipt_val);
    });

    $('.point-modal .save').unbind('click').click(function () {
        var ipt_val = $(".point-modal #point-input").val();
        var selectedPoints = ipt_val.split(",");
        var selectedPointsArr = [];
        for(var i = 0;i<selectedPoints.length;i++) {
            if($.isNumeric(selectedPoints[i])) {
                selectedPointsArr.push(selectedPoints[i]);
            }
        }
        ipt_val = selectedPointsArr.join(',');
        $(obj).next().val(ipt_val);
        if(flag == 'checkbox'){
            getPointCheckBoxByIds(obj, ipt_val);
        }else if($(obj).is('div'))
            getPointByIds2(obj, ipt_val);
    });

}


/**
 *通过Id获取能力
 */
function getAbilityByIds(ids) {
    if(ids == ''){
        $('.ability-modal #ability-container').html('');
        return;
    }
    ids = ids.split(',');
    var ability = getAbilityInfo();

    var html = '<ul class="datalist datalist2" id="ability_list">';
    for (var i in ids){
        if(ability[ids[i]] == undefined)
            continue;
        html += '<li>';
        html += ability[ids[i]].name2;
        html += '<button type="button" class="close" cid="'+ids[i]+'">&times;</button></li>';
    }
    html += '</ul>';
    $('.ability-modal #ability-container').html(html);
    $(".ability-modal #ability_list .close").click(function () {
        var cid = $(this).attr('cid');
        var ipt_val = $(".ability-modal #ability-input").val();
        var ipt_val_arr = ipt_val.split(',');
        var index = ipt_val_arr.indexOf(cid);
        ipt_val_arr.splice(index, 1);
        ipt_val = ipt_val_arr.join(',');
        $(".ability-modal #ability-input").val(ipt_val);
        getAbilityByIds(ipt_val);
    });
}

function showAbilityModal(obj, flag) {
    var flag = flag || '';
    var term_id = $('#term_id').val();
    var subject_id = $('#subject_id').val();
    if(!term_id || !subject_id){
        Notify.danger('请先选择学科和学段');
        return;
    }
    $('#modal-ability').modal('show', {backdrop: 'static'});

    $('#lvl1_id, #lvl2_id').val('');
    var now_val = $(obj).next().val();
    $(".ability-modal #ability-input").val(now_val);
    if(now_val != '') getAbilityByIds(now_val);
    else $('.ability-modal #ability-container').html('');

    $('.ability-modal .ability-add').unbind('click').click(function () {

        var lvl1_id_val = $('#lvl1_id').val();
        var lvl2_id_val = $('#lvl2_id').val();
        if(lvl1_id_val == '' || lvl2_id_val == '')
        {
            Notify.danger('请选择');
            return;
        }
        var val = lvl1_id_val + '-' + lvl2_id_val;
        val = getAbilityByMap(val);

        var ipt_val = $(".ability-modal #ability-input").val();
        var ipt_val_arr = [];
        if(ipt_val != ''){
            ipt_val_arr = ipt_val.split(',');
        }
        if(ipt_val_arr.indexOf(val.toString()) < 0)
            ipt_val += ',' + val;
        else{
            Notify.danger('重复添加, 请重新选择');
            return;
        }

        ipt_val = ipt_val.replace(/^,/, '');
        $(".ability-modal #ability-input").val(ipt_val);
        getAbilityByIds(ipt_val);
    });

    $('.ability-modal .save').unbind('click').click(function () {
        var ipt_val = $(".ability-modal #ability-input").val();
        $(obj).next().val(ipt_val);
        if(flag == 'checkbox'){
            getAbilityCheckBoxByIds(obj, ipt_val);
        }else if($(obj).is('div'))
            getPointByIds2(obj, ipt_val);
    });

}

/**
 *通过Id获取知识点
 */
function getPointByIds(ids) {
    if(ids == ''){
        $('.point-modal #point-container').html('');
        return;
    }
    var params = {'ids':ids};
    $.get('/point/get-point-by-ids',params,function(result) {
        var obj = $.parseJSON(result);

        var html = '<ul class="datalist datalist2" id="point_list">';
        for (var i in obj){
            html += '<li>';
            for  (var j in obj[i]){
                if(j > 0)  html += ' > ';
                html += obj[i][j].name;
            }
            html += '<button type="button" class="close" cid="'+obj[i][j].id+'">&times;</button></li>';
        }
        html += '</ul>';
        $('.point-modal #point-container').html(html);
        $(".point-modal #point_list .close").click(function () {
            var cid = $(this).attr('cid');
            var ipt_val = $(".point-modal #point-input").val();
            var ipt_val_arr = ipt_val.split(',');
            var index = ipt_val_arr.indexOf(cid);
            ipt_val_arr.splice(index, 1);
            ipt_val = ipt_val_arr.join(',');
            if($(".point-modal #point_list li").size() == 1)
                ipt_val = '';
            $(".point-modal #point-input").val(ipt_val);
            getPointByIds(ipt_val);
        });
    });
}

/**
 *通过Id获取知识点
 */
function getPointByIds2(obj, ids) {
    if(ids == ''){
        $(obj).html('知识点').attr('title', '');
        return;
    }
    var params = {'ids':ids};
    $.get('/point/get-point-by-ids',params,function(result) {
        var json = $.parseJSON(result);

        var html = '';
        for (var i in json) {

            for (var j in json[i]) {
                if (j > 0)  html += ' > ';
                html += json[i][j].name;
            }
            html += '; ';
        }
        html = html.replace(/; $/, '');
        $(obj).html(html).attr('title', html);
    });
}

/**
 *通过Id获取知识点
 */
function getPointCheckBoxByIds(obj, ids, checked) {
    if(ids == ''){
        $(obj).html('添加知识点');
        $(obj).prev('.point-checkbox').html('');
        return;
    }
    $(obj).html('编辑知识点');
    var checked = checked || '';
    var checkeds = [];
    if($(obj).prev('.point-checkbox').html().trim() != ''){
        $(obj).prev('.point-checkbox').find('input').each(function () {
            if($(this).prop('checked') == true){
                checkeds.push($(this).val());
            }
        });
        checked = checkeds.join(',');
    }
    var params = {'ids':ids};
    $.get('/point/get-last-point-by-ids',params,function(result) {
        try{
            checkCount++;
        }catch(e){
            checkCount = 0;
        }
        var html = '';
        for (var i in result) {
            var id = result[i].id.toString();
            var chkd = '';
            if(checked.split(',').indexOf(id) != -1)
                chkd = 'checked';
            html += '<input ' + chkd + ' id="point-checkbox-'+checkCount+'-'+id+'" type="checkbox" value="' + id + '"><label for="point-checkbox-'+checkCount+'-'+id+'">' + result[i].name + '</label>&nbsp;';

        }
        $(obj).prev('.point-checkbox').html(html);
    });
}

/**
 *通过Id获取能力
 */
function getAbilityCheckBoxByIds(obj, ids, checked) {
    try{
        checkCount++;
    }catch(e){
        checkCount = 0;
    }
    if(ids == ''){
        $(obj).html('添加能力');
        $(obj).prev('.ability-checkbox').html('');
        return;
    }
    $(obj).html('编辑能力');
    var checked = checked || '';
    var checkeds = [];
    if($(obj).prev('.ability-checkbox').html().trim() != ''){
        $(obj).prev('.ability-checkbox').find('input').each(function () {
            if($(this).prop('checked') == true){
                checkeds.push($(this).val());
            }
        });
        checked = checkeds.join(',');
    }
    ids = ids.split(',');
    var ability = getAbilityInfo();
    var html = '';
    for (var i in ids){
        var id = ids[i];
        var chkd = '';
        if(checked.split(',').indexOf(id.toString()) != -1)
            chkd = 'checked';
        var name = ability[ids[i]].name;
        html += '<input ' + chkd + ' id="ability-checkbox-'+checkCount+'-'+id+'" type="checkbox" value="' + id + '"><label for="ability-checkbox-'+checkCount+'-'+id+'">' + name + '</label>&nbsp;';
    }
    $(obj).prev('.ability-checkbox').html(html);
}

function showChapterModal(obj) {
    var term_id = $('#term_id').val();
    var subject_id = $('#subject_id').val();
    if(term_id == '' || term_id == '0' || subject_id == '' || subject_id == '0'){
        Notify.danger('请先选择学科和学段');
        return;
    }
    $('#modal-7').modal('show', {backdrop: 'static'});

    createChapterSelector(term_id, subject_id);
    var now_val = $(obj).next().val();
    $(".chapter-modal #chapter-input").val(now_val);
    if(now_val != '') getChapterByIds(now_val);
    else $('.chapter-modal #chapter-container').html('');

    $('.chapter-modal .chapter-add').unbind('click').click(function () {
        var val = 0;
        $('.chapter-modal select').each(function (index) {
            var tval = $(this).val();
            if(index == 0 && tval == '0'){
                Notify.danger('请选择');
                return;
            }
            if(tval != '0')
                val = tval;
        });

        var ipt_val = $(".chapter-modal #chapter-input").val();
        var ipt_val_arr = [];
        if(ipt_val != ''){
            ipt_val_arr = ipt_val.split(',');
        }

        if(ipt_val_arr.indexOf(val) < 0)
            ipt_val += ',' + val;
        else{
            Notify.danger('重复添加, 请重新选择');
            return;
        }

        ipt_val = ipt_val.replace(/^,/, '');
        $(".chapter-modal #chapter-input").val(ipt_val);
        getChapterByIds(ipt_val);
    });

    $('.chapter-modal .save').unbind('click').click(function () {
        var ipt_val = $(".chapter-modal #chapter-input").val();
        $(obj).next().val(ipt_val);
        if($(obj).is('div'))
            getChapterByIds2(obj, ipt_val);
    });

}

/**
 *通过Id获取章节
 */
function getChapterByIds(ids) {
    if(ids == ''){
        $('.chapter-modal #chapter-container').html('');
        return;
    }
    var params = {'ids':ids};
    $.get('/chapter/get-chapter-by-ids',params,function(result) {
        var obj = $.parseJSON(result);

        var html = '<ul class="datalist datalist2" id="chapter_list">';
        for (var i in obj){
            html += '<li>';
            for  (var j in obj[i]){
                if(j > 0)  html += ' > ';
                html += obj[i][j].name;
            }
            html += '<button type="button" class="close" cid="'+obj[i][j].id+'">&times;</button></li>';
        }
        html += '</ul>';
        $('.chapter-modal #chapter-container').html(html);
        $(".chapter-modal #chapter_list .close").click(function () {
            var cid = $(this).attr('cid');
            var ipt_val = $(".chapter-modal #chapter-input").val();
            var ipt_val_arr = ipt_val.split(',');
            var index = ipt_val_arr.indexOf(cid);
            ipt_val_arr.splice(index, 1);
            ipt_val = ipt_val_arr.join(',');
            $(".chapter-modal #chapter-input").val(ipt_val);
            getChapterByIds(ipt_val);
        });
    });
}

/**
 *通过Id获取知识点
 */
function getChapterByIds2(obj, ids) {
    if(ids == ''){
        $(obj).html('章节').attr('title', '');
        return;
    }
    var params = {'ids':ids};
    $.get('/chapter/get-chapter-by-ids',params,function(result) {
        var json = $.parseJSON(result);

        var html = '';
        for (var i in json) {

            for (var j in json[i]) {
                if (j > 0)  html += ' > ';
                html += json[i][j].name;
            }
            html += '; ';
        }
        html = html.replace(/; $/, '');
        $(obj).html(html).attr('title', html);
    });
}



