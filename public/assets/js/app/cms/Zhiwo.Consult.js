/*!
 *
 * 咨询管理系统
 * @package		Consult
 * @author		Donghui
 * @date		2012/03/31
 */

if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};

Zhiwo.Consult  = {
	currObj: null,
	currid: 0,
	init: function(){
		$("a[id=toreply]").bind("click", function(){
	    	Zhiwo.Consult.currid = $(this).attr("cid");	
			Zhiwo.Consult.reply();
		});
		
		$("a[id=del]").bind("click", Zhiwo.Consult.deleteItem);

		/** 
		 * 添加控制首页显示
		 * author cj
		 * date 2012/6/26
		 */
		$("input[id=display_place]").bind("click", function(){
			var question_id = $(this).attr('cid');
			var checked = $(this).attr("checked");
			$.get("/cms/consult/place?timestmp" + new Date().getTime(), {question_id:question_id, value:$(this).val(), checked:checked}, function(data){
				if(data == "1")
				{
//                    alert("操作成功！");
				}
				else
				{
					alert("操作失败！");
				}

				location.reload();
			})
		});
	},
	reply: function(){
		Zhiwo.Consult.currObj = KindEditor.dialog({
			width : 610,
			title : '咨询商品',
			body : '<div id="panel" style="width:610px; height:450px; text-align:center"><iframe style="width:600px; height:530px;" frameborder="0" scrolling="auto" ></iframe></div>',
			closeBtn : {
				name : '关闭',
				click : function(e) {
					window.location.href = window.location.href;
					Zhiwo.Consult.currObj.remove();
				}
			}
		});
		$("#panel iframe").attr("src", '/cms/consult/reply?question_id=' + Zhiwo.Consult.currid);
	},
	ShowStatus: function(status){
		if (status != '') {
			var dialog = KindEditor.dialog({
				width : 230,
				title : '状态',
				body : '<div id="panel" style="text-align:center">'+ status +'</div>',
				closeBtn : {
					name : '关闭',
					click : function(e) {
						dialog.remove();
					}
				},yesBtn : {
					name : '确定',
					click : function(e) {
						if(status == "操作成功")
						{
							window.parent.document.location.href = window.parent.document.location.href;
							window.parent.Zhiwo.Consult.currObj.remove();
						}
						dialog.remove();
					}
				},
				noBtn : {
					name : '取消',
					click : function(e) {
						dialog.remove();
					}
				}
			});
		}
	},
	
	deleteItem : function()
	{
		if(confirm("删除此问题吗？"))
		{
			var questionId = $(this).attr("question_id");
			var del = 1;
			$.post("/cms/consult/place", {question_id:questionId, del:del}, function(data){
				if(data == "1")
				{
					alert("删除成功!");
				}
				else
				{
					alert("删除失败!");
				}
				location.href = location.href;
			});
		}
	}
};
