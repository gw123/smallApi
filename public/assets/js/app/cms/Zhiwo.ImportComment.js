if(!window.Zhiwo)
{
	window.Zhiwo = new Object();
}

Zhiwo.ImportComment = {
	//初始化页面动作
	init : function()
	{
		$("input[id=addTime]").calendar({dateFormat: 'YMD-',timeSeparators: [' ']});
		$("textarea[id=comment]").unbind("focus").bind("focus", Zhiwo.ImportComment.addComment);
		$(":button[id=addOneComment]").unbind("click").bind("click", Zhiwo.ImportComment.addOneComment);
		$(":button[id=delOneComment]").unbind("click").bind("click", Zhiwo.ImportComment.delOneComment);
		$("#beginImportComment").unbind("click").bind("click", Zhiwo.ImportComment.checkAllComment);
	},
	//添加一个评论内容
	addComment : function()
	{
		var text = $(this).val();
		var oriTextarea = $(this);
		var dialog = KindEditor.dialog({
			title : '评论内容',
			width : 400,
			height: 200,
			body : '<div id="commentContent" style="width:400px;"><center><textarea rows="6" cols="40">' + text + '</textarea></center></div',
			closeBtn : {
					name : '关闭',
					click: function(e)
					{
						dialog.remove();
					}
			},
			yesBtn : {
					name : '确定', 
				   click : function(e)
				   {
					   var content = $("#commentContent textarea").val();
					   oriTextarea.val(content);
					   dialog.remove();
				   }
			},
			noBtn : {
				   name : '返回',
				  click : function(e)
				  {
					  dialog.remove();
				  }
			}
		});
	$("#commentContent textarea").focus();
	},
	//增加一个添加评论行
	addOneComment : function()
	{
		var oneItem = '<tr id="oneComment">' + $("tr[id=oneComment]").first().html() + '</tr>';
		$("#commentTable").append(oneItem);
		Zhiwo.ImportComment.init();
	},
	//删除一个评论添加行
	delOneComment : function()
	{
		var len = $(":button[id=delOneComment]").length;
		if(len == 1)
		{
			alert("亲~~ 只有一个了，就别删了~ 行不");
			return false;
		}
		if(confirm("你确定删除这个评论吗？"))
		{
			$(this).parent().parent().remove();
		}
	},
	//验证提交评论信息
	checkAllComment : function()
	{
		if(confirm("你确定提交评论吗？"))
		{   
			var isSubmit = true; 
			var addTime = /^\d{4}-\d{2}-\d{2}$/;
			$("input[id=addTime]").each(function(){
					if(!addTime.test($(this).val()))
					{
						alert("请正确填写评论时间！");
						$(this).focus();
						return isSubmit = false;
					}
			});
			
			if(!isSubmit)
			{
				return isSubmit;
			}
			
			var goodsId = /^\d+$/;
			$("input[id=goodsId]").each(function(){
					if(!goodsId.test($(this).val()))
					{
						alert("请输入正确商品ID");
						$(this).focus();
						return isSubmit = false;
					}
			});

			if(!isSubmit)
			{
				return isSubmit;
			}

			if(!isSubmit)
			{
				return isSubmit;
			}

			$("input[id=author]").each(function(){
					if($(this).val() == "")
					{
						alert("请输入正确的作者名");
						$(this).focus();
						return isSubmit = false;
					}
			});

			if(!isSubmit)
			{
				return isSubmit;
			}


			$("textarea[id=comment]").each(function(){
					if($(this).val() == "")
					{
						alert("请输入正确的评论内容");
						$(this).focus();
						return isSubmit = false;
					}
			});

			if(!isSubmit)
			{
				return isSubmit;
			}

			var goodsPoint = /^\d$/;
			$("input[id=goodsPoint]").each(function(){
					if(!goodsPoint.test($(this).val()) || $(this).val() > 5)
					{
						alert("请输入正确的评分");
						$(this).focus();
						return isSubmit = false;
					}
			});

				return isSubmit;
		}

		return false;
	}
};

$(function(){
	Zhiwo.ImportComment.init();
});
