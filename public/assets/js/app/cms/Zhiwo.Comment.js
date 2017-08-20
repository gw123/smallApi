if(!window.Zhiwo)
{
	window.Zhiwo = new Object();
}

Zhiwo.Comment = {
	type : '',
	init : function()
	{
		$("#searchForm input[name=begin_time]").calendar({date_Format:'YMD-',timeSeparators:['']});
		$("#searchForm input[name=end_time]").calendar();
		$("a[id=replyComment]").bind("click", Zhiwo.Comment.OPdialog);
		$("a[id=replyQuestion]").bind("click", Zhiwo.Comment.OPdialog);
		$("a[id=editCommentReply]").bind("click", Zhiwo.Comment.OPdialog);
		$("a[id=editQuestionReply]").bind("click", Zhiwo.Comment.OPdialog);
		$("a[id=displayOrder]").bind("click", Zhiwo.Comment.OPdialog);
        $("#insertQuestion").bind("click", Zhiwo.Comment.OPdialog);
		$("a[id=displayPlace]").bind("click", Zhiwo.Comment.changeDisplayPlace);
		$("td[id=questionReply]").hover(Zhiwo.Comment.mOver, Zhiwo.Comment.mOut);
        $("#export").bind("click", Zhiwo.Comment.Export);
	}, 

	//开启一个新对话
	OPdialog : function()
	{
		var type = $(this).attr('id');
		Zhiwo.Comment.type = type;
		var info = $(this).attr('name').split('_', 4);
        var id = info[0];
		var replyArea = "<hr /><b>发表回复</b><textarea name='reply' cols='55' rows='5'></textarea>" +
						"<font style='color:#7B7B7B;margin:0px;'>回复长度在5-300个字符之间</font>" +
						'<input type="hidden" name="id" value="' + id + '" />';

		if(type == 'replyComment' || type == 'replyQuestion')
		{
			var author = info[1];
			var time = info[2];
			var content = info[3];
			var dialogBody = "作者:&nbsp;&nbsp;<span style='color:blue;width:480px;'>" + author + 
					     	 "</span><br />时间:&nbsp;&nbsp;<span style='color:blue;widht:480px;'>" + time +
				             "</span><br />内容:&nbsp;&nbsp;<span style='color:blue;width:480px;'>" + content + 
				             "</span>" +replyArea;
			var title = "回复窗口";
			var width = 500;
			var yesBtn = "回复";
			var yesFunction = Zhiwo.Comment.reply;
		}
		else if(type == "editCommentReply" || type == "editQuestionReply")
		{
			var title = "修改回复";
			var author = $(this).parent().siblings("td[name=replyAuthor]").text();
			var content = $(this).text();
			var yesBtn = "修改";
			var dialogBody = "作者(回复时间):&nbsp;&nbsp;<span style='color:blue;'>" + author +
							 "</span>" + replyArea;
			var yesFunction = Zhiwo.Comment.reply;
		}
		else if(type == "displayOrder")
		{
			var title = "更改显示排序";
			var width = 200;
			var yesBtn = "修改";
			var yesFunction = Zhiwo.Comment.changeOrder;
			var dialogBody = "<input type='text' name='order' value='" + $(this).attr("value") + 
							 "'/><input type='hidden' name='id' value='" + id + "' /> ";
		}
        else if(type == "insertQuestion")
        {
            var title = "插入咨询";
            var width = 500;
            var yesBtn = "插入" ;
            var yesFunction = Zhiwo.Comment.insertQuestion;
            var dialogBody = '<select name="questionType">\
    		                     <option value="0">咨询类型</option>\
    		                     <option value="169">消炎祛痘</option>\
                                 <option value="170">敏感损伤</option>\
                                 <option value="171">美白淡斑</option>\
                                 <option value="173">保湿补水</option>\
                                 <option value="49999">药妆咨询</option>\
                             </select>\
    	            	         &nbsp;&nbsp;显示位置:\
                                 <input type="checkbox" value="1" />团购页显示\
    	            	         <input type="checkbox" value="2" checked="checked"/>列表页\
    	            	         <input type="checkbox" value="8" />口碑主页</option>\
    	            	     <hr />\
                             发表人:<input type="text" name="author" />\
                             发表时间:<input type="text" name="pubTime" /><br />\
                             发表内容:<textarea name="pubContent" cols="45" rows="5"></textarea>\
                             <hr />回复人:<input type="text" name="replyer" />\
                             回复时间:<input type="text" name="replyTime" /><br />\
                             回复内容:<textarea name="replyContent" cols="45" rows="5"></textarea>';
        }

		var dialog = KindEditor.dialog({
				width : width,
				title : title, 
				body : '<div id="dialogDiv" style="margin:0px 15px 0px 15px;">' +
					   '<div name="Msg" style="height:20px;margin:0px;text-align:center;"></div>' +
		   			   dialogBody + '</div>',
			 	closeBtn : 
				{
					name : "关闭",
					click : function(e)
					{
						dialog.remove()
					}
				},
				noBtn : 
				{
					name : "返回",
					click: function(e)
					{
						dialog.remove();
					}
				},
				yesBtn : 
				{
					name : yesBtn, 
					click : function(e)
					{
						yesFunction();
					}
				}
		});

		if(type == "editCommentReply" || type == "editQuestionReply")
		{
			$("#dialogDiv textarea[name=reply]").val($.trim(content));
		}

        if(type == "insertQuestion")
        {
            $("#dialogDiv input[name=replyTime]").calendar();
		    $("#dialogDiv input[name=pubTime]").calendar();
            $("#calendar_div").css({"z-index":999999});
        }
		
		if(type == "displayOrder")
		{
			$("#dialogDiv input[name=order]").focus();
		}
		else
		{
			$("#dialogDiv textarea[name=reply]").focus();
		}

       		
		var submit = $(".ke-dialog-footer :button[value=" + yesBtn + "]");
		$(window).keydown(function(event){
			if(event.keyCode == '13' && submit.css("display") != "none"){
				submit.hide();
				submit.trigger("click");
			}
		});

	},

	//回复评论,和咨询函数
	reply : function()
	{
		if(confirm("你确定提交回复吗？"))
		{
			var replyContent = $("#dialogDiv textarea[name=reply]");
			var len = replyContent.val().length;
			if(len < 5 || len > 300)
			{
				Zhiwo.Comment.showMsg('请按要求输入回复', 'red');
				return false;
			}

			$(".ke-dialog-footer :button[value=回复]").hide();
			$(".ke-dialog-footer :button[value=修改]").hide();

			Zhiwo.Comment.showMsg('正在回复, 请稍后...', 'blue');
			var id = $("#dialogDiv input[name=id]").val();
			switch(Zhiwo.Comment.type)
			{
				case "replyComment":
					var url = "/cms/comment/reply?random=" + Math.random() ;
					break;
				case "replyQuestion":
					var url = "/cms/consult/reply?random=" + Math.random();
					break;
				case "editCommentReply":
					var url = "/cms/comment/reply?act=edit&random=" + Math.random();
					break;
				case "editQuestionReply":
					var url = "/cms/consult/reply?act=edit&random=" + Math.random();
					break;
			}

			var params = {id:id, content:replyContent.val()};
			$.post(url, params, function(Json){
				if(Json.status == 1)
				{
					Zhiwo.Comment.showMsg(Json.msg, 'blue');
					setTimeout(function(){location.reload();},1000);;
				}
				else
				{
					Zhiwo.Comment.showMsg(Json.msg, 'red');
				}
			});
		}
		else
		{
			$(".ke-dialog-footer :button[value=回复]").show();
			$(".ke-dialog-footer :button[value=修改]").show();
		}
	},

	//修改评论和咨询显示位置
	changeDisplayPlace : function()
	{
        if(!confirm("你确认修改显示位置吗?"))
        {
            return false;
        }

		var type = $(this).attr("name");
		if(type == "comment")
		{
			var url = "/cms/comment/place?random=" + new Date().getTime()+Math.random();
		}
		else
		{
			var url = "/cms/consult/place?random=" + Math.random();
		}
		
		var itemId = $(this).parent().parent().find("#itemId").val();
		var act = $(this).attr("title");
		var value = $(this).attr("value");
		var params = {act:act, value:value, id:itemId};
		$.post(url, params, function(json){
			if(json == '1')
			{
				location.reload();
			}
			else
			{
				alert("更改失败");
				$(".ke-dialog-footer :button[value=修改]").show();
			}
		});
	},

	//更改评论排序
	changeOrder : function()
	{
		if(confirm("确认更改评论排序值吗？"))
		{
			var url = "/cms/comment/place?random=" + Math.random();
			var id = $("#dialogDiv input[name=id]").val();
			var val = $("#dialogDiv input[name=order]").val();
			var params = {id:id, value:val, act:"order"};
			$.post(url, params, function(json){
				if(json == '1')
				{
					location.reload();
				}
				else
				{
					alert("修改失败！");
				}
			});
		}
		else
		{
			$(".ke-dialog-footer :button[value=修改]").show();
		}
	},

	//信息提示
	showMsg : function(msg, color)
	{
		var msgDiv = $("#dialogDiv div[name=Msg]");
			msgDiv.html(msg);
			msgDiv.css('color', color);
			msgDiv.css('font-size', 20);
	},

	/*杀死一个咨询的回复
	killReply : function()
	{
		var replyId = $(this).attr("name");
		$(this).css("background-color", "yellow");
	}
	*/
	//咨询回复状态--鼠标悬停
	mOver : function()
	{
		var type = parseInt($(this).attr("class"));
		var id = $(this).attr("name");
		if(type == 0)
		{
			$(this).append("<span id='status' style='float:right;'>状态：显示</span>");
		}
		else
		{
			$(this).append("<span id='status' style='float:right;color:yellow;'>状态：不显示</span>");
		}

		$(this).find("#status").bind("click", function(){
			$(this).hide();
			var url = '/cms/consult/reply_status?random' + Math.random();
			var params = {status:type, id:id};
			$.post(url, params, function(res){
				if(res == "1")
				{
					location.reload();
				}
				else
				{
					alert("更改失败！");
				}
			});
		});
	},

    insertQuestion:function()
    {
        var link = '/cms/consult/add?random=' + Math.random();
        var type = $("#dialogDiv select[name=questionType] option:selected").val();
        var displayPlace = 0;
        $("#dialogDiv input:checked").each(function(){
            displayPlace += ~~$(this).val();
        });

        if(type == '0' || displayPlace == 0)
        {
            alert("请选择问题分类和显示位置!");
            return false;
        }
        var pubContent = $.trim($("#dialogDiv textarea[name=pubContent]").val());
        if(pubContent == '')
        {
            alert("请输入提问内容！");
            return false;
        }
        var replyContent = $.trim($("#dialogDiv textarea[name=replyContent]").val());
        if(replyContent == '')
        {
            alert("请输入回复内容!");
            return false;
        }

        var flag = false;
        $("#dialogDiv input").each(function(){
            if($.trim($(this).val()) == '')
            {
                alert("小白，是你吧！\n所有框框都得填上才能提交！");
                flag = true;
                return false;
            }
        });

        if(flag)
        {
            return false;
        }
        var params = {
                type : type,
                displayPlace : displayPlace,
                author : $("#dialogDiv input[name=author]").val(),
                pubTime : $("#dialogDiv input[name=pubTime]").val(),
                pubContent : pubContent,
                replyer : $("#dialogDiv input[name=replyer]").val(),
                replyTime :　$("#dialogDiv input[name=replyTime]").val(),
                replyContent : replyContent
        };

        $.post(link, params, function(res){
            if(res == '1')
            {
                alert("发布成功");
                location.reload();
            }
            else
            {
                alert("发布失败");
            }
        });
    },
	//咨询回复状态--鼠标移走
	mOut : function()
	{
		$(this).find("#status").remove();
	},

    //导出商品评论
    Export : function()
    {
        document.getElementById("searchForm").action="/cms/comment/export";
        $("#searchForm").submit();
    }

};

$(function(){
	Zhiwo.Comment.init();
});
