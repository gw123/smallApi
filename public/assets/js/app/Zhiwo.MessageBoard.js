/**
 * Created by baykier on 2016/12/27.
 * Zhiwo.MessageBoard 简易留言板
 * requires
 *      [
 *          jQuery 1.4.4 +
 *          KindEditor 4.1.10 +
 *      ]
 */
if (!window.Zhiwo) {
    window.Zhiwo = new Object();
}
Zhiwo.MessageBoard = {
    def:{
        show:true,//是否展示留言框 默认显示
        button:"#message-board-btn",//触发按钮
        name:'',//用户
        uid:0,//用户ID
        objType:0,//类型,
        objId:0,//类型ID
        maxLength:200,
        container:'.message-board-container-box',//历史列表容器
        firstFresh:false,
        toggle:false
    },
    init:function (obj) {
        Zhiwo.MessageBoard.def = $.extend({},Zhiwo.MessageBoard.def,obj);
        Zhiwo.MessageBoard.showMessageList();
    },
    /**
     * @打开留言板留言
     */
    openMessageBoard:function () {
        if (!Zhiwo.MessageBoard.def.show){
            return;
        }
        var html = '<div id="message-board-show-form"><form><table style="width: 100%;border: hidden"><tr><td>' +
            '<textarea name="message" id="message-board-content" cols="65" rows="5" maxlength="'+Zhiwo.MessageBoard.def.maxLength+'"></textarea></td></tr>'+
            '<tr><td><span>还能输入</span><strong id="message-board-content-length">'+Zhiwo.MessageBoard.def.maxLength+'</strong><span>个字</span></td></tr></table></form>' +
            '</div>';
        var dialog = KindEditor.dialog({
            width : 480,
            title :"添加备注(用户:" + Zhiwo.MessageBoard.def.name + ")",
            body : html,
            closeBtn : {
                name : '关闭',
                click : function(e) {
                    dialog.remove();
                }
            },yesBtn : {
                name:"保存",
                click:function (e) {
                    if ($("#message-board-content").val().length <= 0)
                    {
                        alert("备注内容不能为空");
                        return;
                    }
                    /*  保存消息 */
                    var data = {
                        "uid":Zhiwo.MessageBoard.def.uid,
                        "name":Zhiwo.MessageBoard.def.name,
                        "obj_type":Zhiwo.MessageBoard.def.objType,
                        "obj_id":Zhiwo.MessageBoard.def.objId,
                        "message":$("#message-board-content").val()
                    };
                    $.post("/cms/messageboard/add",data,function (ret) {
                        try{
                            ret = JSON.parse(ret);
                            if (ret.error == 0){
                                $("#message-board-list-ul").html("");
                                Zhiwo.MessageBoard.showMessageList();
                            }
                        }catch (e){
                            alert("操作失败!")
                        }

                        dialog.remove();
                    },'html')
                }
            }
        });
        Zhiwo.MessageBoard.refreshMsg();
        $("#message-board-content").focus();
    },
    /**
     * @展示历史消息
     */
    showMessageList:function () {
        if (!Zhiwo.MessageBoard.def.firstFresh){
            Zhiwo.MessageBoard.def.firstFresh = true;
            $(Zhiwo.MessageBoard.def.container).hide();
            var html = '<div><div id="message-board-main-container"><ul id="message-board-list-ul" ' +
                'style="list-style-type:none;margin:0;padding:0;"></ul><button type="button" ' +
                'id="message-board-switch-btn" style="float: right">&nbsp;显示更多&nbsp;</button><button type="button" style="float: right;" id="message-board-btn">&nbsp;添加备注&nbsp;</button></div>';
            $(Zhiwo.MessageBoard.def.container).parent().append(html);
            $(Zhiwo.MessageBoard.def.button).unbind().bind('click',function () {
                Zhiwo.MessageBoard.openMessageBoard();
            });
            $(".message-board-message-list").hide();
            $("#message-board-switch-btn").unbind().bind('click',function () {
                if (Zhiwo.MessageBoard.def.toggle){
                    $(this).html('显示更多');
                    Zhiwo.MessageBoard.def.toggle = false;
                    $(".message-board-message-list").hide();
                    $("#message-board-list-ul").find('li').first().show();
                }else {
                    $(this).html('折叠');
                    $(".message-board-message-list").show();
                    Zhiwo.MessageBoard.def.toggle = true;
                }
            });
            if (!Zhiwo.MessageBoard.def.show)
            {
                $("#message-board-btn").hide();
            }
        }
        //保存原来信息
        $.get('/cms/messageboard/list?obj_type='+Zhiwo.MessageBoard.def.objType+'&obj_id='+Zhiwo.MessageBoard.def.objId,
            function (res) {
            try {
                res = JSON.parse(res);
                if (res.error == '0')
                {
                    var messageList = '';
                    var d;
                    for(i in res.content.rows){
                        messageList += '<li class="message-board-message-list" style="margin:0;padding:0;border-bottom:1px dashed #d8d8d8;background-color: ' + ((i% 2 == 0) ? '#F2F2F2;' : '#FAFAFA;') +'"><p style="margin:0;padding: 10px;">'+
                            res.content.rows[i]['name'] + ':&nbsp;&nbsp;' + res.content.rows[i]['message'] + '</p>';
                        d = new Date(parseInt(res.content.rows[i]['created']) * 1000);
                        messageList += '<p style="text-align:right;color:#889db6;font:12px/18px arial;margin:0;padding: 10px;">' + d.getFullYear() +'年' + (d.getMonth()+1) + '月' + d.getDay() + '日' + d.getHours()+ ':' + d.getMinutes()+':' + d.getSeconds()+'</p></li>';
                    }
                    //新增到列表最前面
                    $("#message-board-list-ul").prepend(messageList);
                }
                // 把最原始的加入到li
                $("#message-board-list-ul").append('<li style="margin: 0;padding: 0" class="message-board-message-list"><p style="margin: 0;padding: 10px">' + $(Zhiwo.MessageBoard.def.container).html()+'</p></li>');
                if (!Zhiwo.MessageBoard.def.toggle)
                {
                    $(".message-board-message-list").hide();
                    $("#message-board-list-ul").find('li').first().show();
                }
                //是否显示 显示更多
                if($("#message-board-list-ul").find('li').length <= 1)
                {
                    $("#message-board-switch-btn").hide();
                }else {
                    $("#message-board-switch-btn").show();
                }
            }catch (e)
            {
                alert("加载评论失败!")
            }
        },'html');
    },
    /**
     * @更新提示
     */
    refreshMsg:function () {
        $("#message-board-content").bind('change',function () {
            $("#message-board-content-length").html(Zhiwo.MessageBoard.def.maxLength - $(this).val().length)
        });
        $("#message-board-content").bind('keyup',function () {
            $("#message-board-content-length").html(Zhiwo.MessageBoard.def.maxLength - $(this).val().length)
        })
        $("#message-board-content").bind('focus',function () {
            $("#message-board-content-length").html(Zhiwo.MessageBoard.def.maxLength - $(this).val().length)
        })
    }
};

