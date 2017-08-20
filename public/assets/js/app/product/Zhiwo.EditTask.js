/*!
 *
 * 编辑任务
 * @package		EditTask
 * @author		zhaoshunyao
 * @date		2012/04/03
 */

if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};

Zhiwo.EditTask  = {
	openEditBox : function(dialogTitle, goodsID)
	{
		Zhiwo.DialogBox.ScreenConvert();
		var boxBody;
		boxBody='<div id="DialogTop"><div id="DialogTitle">'+dialogTitle+'</div><span class="close" onclick="return Zhiwo.DialogBox.DialogHide();">关闭</span></div>';
		boxBody +='<div id="DialogContent"></div>';
		Zhiwo.DialogBox.DialogShow(boxBody,600,400,500,260);
		Zhiwo.Ajaxhttp.getR('/product/goods/load/ajax/'+goodsID, this.callBackLoad);
	},
	callBackLoad : function(data)
	{
		var msgtip = gid("DialogContent");
		if(data)
		{
			var jsObject = eval('('+data+')');
			if(jsObject.msg == 'ok')
			{
				var msgBody;
				msgBody='<br /><table cellspacing="1" cellpadding="1" width="98%" borde=0>';
				msgBody+='<form name="editForm" action="return false;" method="post">';
				msgBody+='<tr><td width="100" height="23" valign="top" align="right">分类名称：</td><td width="400" align="left"><input type="text" name="sortname" size="20" maxlength="10" value="'+jsObject.data.name+'" /> &nbsp;请输入4-10个字</td></tr>';
				msgBody+='<tr><td width="100" height="23" valign="top" align="right">排序：</td><td width="400" align="left"><input type="text" name="sortorder" size="6" maxlength="5" value="'+jsObject.data.orderby+'" />&nbsp; 请输入数字，数字越小排位越靠前。</td></tr>';
				msgBody+='<tr><td width="100" height="80" valign="top" align="right">描述：</td><td width="400" align="left"><textarea name="sortdesc" rows="5" cols="25">'+jsObject.data.description+'</textarea></td></tr>';
				msgBody+='<tr><td width="100" height="23" valign="top" align="right">&nbsp;</td><td width="400" align="left"><input name="sortid" type="hidden" value="'+jsObject.data.id+'" /><input name="submit" type="button" onclick="return Zhiwo.Cms.editSort();" value="保 存" />&nbsp;&nbsp;&nbsp;&nbsp;<input name="cancel" type="button" onclick="return Zhiwo.DialogBox.DialogHide();" value="取 消" /></td></tr>';
				msgBody+='</form></table>';
				msgtip.innerHTML = msgBody;
			}
			else
			{
				msgtip.innerHTML = '<font color="red"><br /><br />取得分类信息失败！</font>';
			}
		}
		else
		{
			msgtip.innerHTML = '<font color="red"><br /><br />正在加载中,请稍候...</font>';
		}
	},
	editSort : function()
	{
		var objForm = document.editForm;
		if(objForm.sortname.value=="")
		{
			alert("请填写分类名称！");
			return false;
		}
		var postData = "id=" + objForm.sortid.value +"&name=" + str_encode(objForm.sortname.value) + "&order=" + objForm.sortorder.value + "&desc=" + str_encode(objForm.sortdesc.value);
		Zhiwo.Ajaxhttp.postR('/cms/article/sort/edit', Zhiwo.Cms.callBackEdit, postData);
	},
	callBackEdit : function(data)
	{
		var msgtip = gid("DialogContent");
		if(data)
		{
			var jsObject = eval('('+data+')');
			if(jsObject.msg == 'ok')
			{
				msgtip.innerHTML = '<font color="green"><br /><br />编辑成功！</font>';
				window.setTimeout(Zhiwo.DialogBox.DialogHide, 2000);
				window.setTimeout("self.location.reload();", 1000);
			}
			else
			{
				msgtip.innerHTML = '<font color="red"><br /><br />编辑失败！</font>';
			}
		}
		else
		{
			msgtip.innerHTML = '<font color="red"><br /><br />正在提交中,请稍候...</font>';
		}
	}
};