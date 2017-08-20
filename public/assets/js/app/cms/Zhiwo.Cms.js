/*!
 *
 * 文章管理系统
 * @package		Cms
 * @author		zhaoshunyao
 * @date		2012/03/31
 */

if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};

Zhiwo.Cms  = {
	openAddBox : function(dialogtitle)
	{
		var msgBody;
		msgBody='<form name="addForm" action="return false;" method="post">';
		msgBody+='<table class="noborder">';
		msgBody+='<tr><td width="100" height="23" valign="top" align="right">ID 别名：</td><td width="400" align="left"><input type="text" name="cname" size="20" maxlength="16" value="" /> &nbsp;请输入少于16个字母</td></tr>';
		msgBody+='<tr><td width="100" height="23" valign="top" align="right">分类名称：</td><td width="400" align="left"><input type="text" name="sortname" size="20" maxlength="10" value="" /> &nbsp;请输入4-10个字</td></tr>';
		msgBody+='<tr><td width="100" height="23" valign="top" align="right">上级分类：</td><td width="400" align="left"><select name="parentid"><option value="0">无</option>'+sortSelect+'</select>&nbsp; 顶级分类没有上级分类，请选无。</td></tr>';
		msgBody+='<tr><td width="100" height="23" valign="top" align="right">排序：</td><td width="400" align="left"><input type="text" name="sortorder" size="6" maxlength="5" value="10" />&nbsp; 请输入数字，数字越小排位越靠前。</td></tr>';
		msgBody+='<tr><td width="100" height="80" valign="top" align="right">描述：</td><td width="400" align="left"><textarea name="sortdesc" rows="3" cols="28"></textarea></td></tr>';
		msgBody+='<tr><td width="100" height="23" valign="top" align="right">&nbsp;</td><td width="400" align="left"><input name="submit" type="button" onclick="return Zhiwo.Cms.addSort();" value="保 存" />&nbsp;&nbsp;&nbsp;&nbsp;<input name="cancel" type="button" onclick="return Zhiwo.DialogBox.DialogHide();" value="取 消" /></td></tr>';
		msgBody+='</table></form>';
		Zhiwo.DialogBox.DialogShow(dialogtitle,msgBody,600,400,500,280);
	},
	addSort : function()
	{
		var objForm = document.addForm;
		if(document.addForm.sortname.value=="")
		{
			alert("请填写分类名称！");
			return false;
		}
		var postData = "name=" + str_encode(objForm.sortname.value) + "&cname=" + objForm.parentid.cname + "&parentid=" + objForm.parentid.value + "&order=" + objForm.sortorder.value + "&desc=" + str_encode(objForm.sortdesc.value);
		Zhiwo.Ajaxhttp.postR('/cms/article/sort/add', Zhiwo.Cms.callBackAdd, postData);
	},
	callBackAdd : function(data)
	{
		var msgtip = gid("DialogContent");
		if(data)
		{
			var jsObject = eval('('+data+')');
			if(jsObject.msg == 'ok')
			{
				msgtip.innerHTML = '<font color="green"><br /><br />添加成功！</font>';
				window.setTimeout(Zhiwo.DialogBox.DialogHide, 2000);
				window.setTimeout("self.location.reload();", 1000);
			}
			else
			{
				msgtip.innerHTML = '<font color="red"><br /><br />添加失败！</font>';
			}
		}
		else
		{
			msgtip.innerHTML = '<font color="red"><br /><br />正在提交中,请稍候...</font>';
		}
	},

	openEditBox : function(dialogtitle, sortid)
	{
		Zhiwo.DialogBox.DialogShow(dialogtitle,'',600,400,500,260);
		Zhiwo.Ajaxhttp.getR('/cms/article/sort/get/'+sortid, Zhiwo.Cms.callBackGet);
	},
	callBackGet : function(data)
	{
		var msgtip = gid("DialogContent");
		if(data)
		{
			var jsObject = eval('('+data+')');
			if(jsObject.msg == 'ok')
			{
				var msgBody;
				msgBody='<br /><form name="editForm" action="return false;" method="post">';
				msgBody+='<table class="noborder">';
				msgBody+='<tr><td width="100" height="23" valign="top" align="right">ID 别名：</td><td width="400" align="left"><input type="text" name="cname" size="20" maxlength="16" value="'+jsObject.data.cname+'" /> &nbsp;请输入少于16个字母</td></tr>';
				msgBody+='<tr><td width="100" height="23" valign="top" align="right">分类名称：</td><td width="400" align="left"><input type="text" name="sortname" size="20" maxlength="10" value="'+jsObject.data.name+'" /> &nbsp;请输入4-10个字</td></tr>';
				msgBody+='<tr><td width="100" height="23" valign="top" align="right">排序：</td><td width="400" align="left"><input type="text" name="sortorder" size="6" maxlength="5" value="'+jsObject.data.orderby+'" />&nbsp; 请输入数字，数字越小排位越靠前。</td></tr>';
				msgBody+='<tr><td width="100" height="80" valign="top" align="right">描述：</td><td width="400" align="left"><textarea name="sortdesc" rows="3" cols="28">'+jsObject.data.description+'</textarea></td></tr>';
				msgBody+='<tr><td width="100" height="23" valign="top" align="right">&nbsp;</td><td width="400" align="left"><input name="sortid" type="hidden" value="'+jsObject.data.id+'" /><input name="submit" type="button" onclick="return Zhiwo.Cms.editSort();" value="保 存" />&nbsp;&nbsp;&nbsp;&nbsp;<input name="cancel" type="button" onclick="return Zhiwo.DialogBox.DialogHide();" value="取 消" /></td></tr>';
				msgBody+='</table></form>';
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
		var postData = "id=" + objForm.sortid.value +"&name=" + str_encode(objForm.sortname.value) + "&cname=" + objForm.cname.value + "&order=" + objForm.sortorder.value + "&desc=" + str_encode(objForm.sortdesc.value);
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