/*!
 *
 * 预存款操作
 * @package		Imprest
 * @author		zhaoshunyao
 * @date		2012/04/30
 */

if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};

Zhiwo.Imprest  = {
	viewBalance : function(memberId, memberName)
	{
		if(memberId == '' || memberId == 0)
		{
			return false;
		}
		var dialogTitle = '会员: “'+memberName+'” 预存款使用明细';
		var body='<iframe frameborder=0 width=800 height=380 marginheight=0 marginwidth=0 scrolling="yes" src="/financial/imprest/view?member_id='+memberId+'"></iframe>';
		Zhiwo.DialogBox.DialogShow(dialogTitle,body,700,400,800,400);
	},
	recharge : function(memberId, memberName)
	{
		var dialogtitle = '给会员“'+memberName+'” 充值';
		var body;
		body='<form name="rechargeForm" action="return false;" method="post">';
		body+='<table class="noborder">';
		body+='<tr><td width="100" height="23" align="right">充值金额:</td><td width="290" align="left"><input type="text" name="money" size="10" maxlength="5" value="" /> 元</td></tr>';
		body+='<tr><td width="100" height="40" valign="top" align="right">备 注:</td><td width="290" align="left"><textarea rows="3" cols="25" name="memo"></textarea><br />(限140字以内)';
		body+='<input type="hidden" name="member_id" value="'+memberId+'" /><input type="hidden" name="member_name" value="'+memberName+'" /></td></tr>';
		body+='<tr><td width="100" height="23" align="right">&nbsp;</td><td width="290" align="left">';
		body+='<input name="submit" type="button" class="button" onClick="Zhiwo.Imprest.rechargeSubmit();" value="提 交" />&nbsp;&nbsp;';
		body+='<input name="close" type="button" class="button" onClick="Zhiwo.Imprest.close();" value="取 消" />';
		body+='</td></tr></table></form>';
		Zhiwo.DialogBox.DialogShow(dialogtitle,body,700,350,380,230);
	},
	rechargeSubmit : function()
	{
		var objForm = document.rechargeForm;
		if(objForm.money.value=='' && objForm.money.value==0)
		{
			alert("请填写充值金额！");
			return false;
		}
		var postData = "member_id=" + objForm.member_id.value + "&member_name=" + str_encode(objForm.member_name.value) + "&money=" + objForm.money.value + "&memo=" + str_encode(objForm.memo.value);
		Zhiwo.Ajaxhttp.postR(
			'/financial/imprest/recharge',
			function(data){
				var msgtip = gid("DialogContent");
				if(data){
					if(data == 'succ'){
						msgtip.innerHTML = '<p style="font-size:14px;color:green;text-align:center"><br /><br />充值完成！</p>';
						window.setTimeout(Zhiwo.DialogBox.DialogHide, 2000);
						window.setTimeout("self.location.reload();", 1000);
					}else{
						msgtip.innerHTML = '<p style="font-size:14px;color:red;text-align:center"><br /><br />充值失败！</p>';
					}
				}else{
					msgtip.innerHTML = '<p style="font-size:13px;color:#000;text-align:center"><br /><br />正在提交中,请稍候...</p>';
				}
			},
			postData
		);
	},

	reject : function(applyId, memberId, memberName,money)
	{
		var dialogtitle = '驳回会员“'+memberName+'” 的提现申请';
		var body;
		body='<form name="rejectForm" action="return false;" method="post">';
		body+='<table class="noborder">';
		body+='<tr><td width="100" height="50" valign="middle" align="right">驳回理由:</td><td width="390" align="left">(限制140字以内)<br /><textarea name="reason" rows="5" cols="30"></textarea>';
		body+='<input type="hidden" name="member_id" value="'+memberId+'" /><input type="hidden" name="apply_id" value="'+applyId+'" /><input type="hidden" name="money" value="'+money+'" /></td></tr>';
		body+='</table></form>';
		body+='<table class="noborder"><tr><td>';
		body+='<input name="submit" type="button" class="button" onClick="Zhiwo.Imprest.rejectSubmit();" value="提 交" />&nbsp;&nbsp;';
		body+='<input name="close" type="button" class="button" onClick="Zhiwo.Imprest.close();" value="取 消" />';
		body+='</td></tr></table>';
		Zhiwo.DialogBox.DialogShow(dialogtitle,body,700,350,400,230);
	},
	rejectSubmit : function()
	{
		var objForm = document.rejectForm;
		if(objForm.reason.value == '')
		{
			alert("请填写驳回理由！");
			return false;
		}
		var postData = "member_id=" + objForm.member_id.value + "&apply_id=" + objForm.apply_id.value + "&reason=" + objForm.reason.value+"&money=" + objForm.money.value;
		Zhiwo.Ajaxhttp.postR(
			'/financial/takeaway/reject', 
			function(data){
				var msgtip = gid("DialogContent");
				if(data){
					if(data == 'succ'){
						msgtip.innerHTML = '<p style="font-size:14px;color:green;text-align:center"><br /><br />提交完毕！</p>';
						window.setTimeout(Zhiwo.DialogBox.DialogHide, 2000);
						window.setTimeout("self.location.reload();", 1000);
					}else{
						msgtip.innerHTML = '<p style="font-size:14px;color:red;text-align:center"><br /><br />提交失败！</p>';
					}
				}else{
					msgtip.innerHTML = '<p style="font-size:14px;color:#000;text-align:center"><br /><br />正在提交中,请稍候...</p>';
				}
			},
			postData
		);
	},

	complete : function(applyId, memberId, memberName, money)
	{
		var dialogtitle = '完成会员“'+memberName+'” 的提现申请';
		var body;
		body='<form name="completeForm" action="return false;" method="post">';
		body+='<table class="noborder">';
		body+='<tr><td width="100" height="20" valign="middle" align="right">帐户余额:</td><td width="390" align="left"><span id="balanceTips"></span></td></tr>';
		body+='<tr><td width="100" height="20" valign="middle" align="right">提现金额:</td><td width="390" align="left"><input type="text" size="10" maxlength="5" name="money" value="'+money+'" readonly/> 元</td></tr>';
		body+='<tr><td width="100" height="40" valign="middle" align="right">备注:</td><td width="390" align="left"><textarea name="remarks" rows="5" cols="30"></textarea><br />(限制140字以内)';
		body+='<input type="hidden" name="member_id" value="'+memberId+'" /><input type="hidden" name="member_name" value="'+memberName+'" /><input type="hidden" name="apply_id" value="'+applyId+'" /></td></tr>';
		body+='</table></form>';
		body+='<table class="noborder"><tr><td>';
		body+='<input name="submit" type="button" class="button" onClick="Zhiwo.Imprest.completeSubmit();" value="完 成" />&nbsp;&nbsp;';
		body+='<input name="close" type="button" class="button" onClick="Zhiwo.Imprest.close();" value="取 消" />';
		body+='</td></tr></table>';
		Zhiwo.DialogBox.DialogShow(dialogtitle,body,700,350,400,280);
		Zhiwo.Ajaxhttp.getR(
			'/financial/takeaway/getbalance?member_id='+memberId,
			function(data){
				var msgtip = gid("balanceTips");
				if(data){
					var jsObject = eval('('+data+')');
					if(jsObject.status=='succ'){
						msgtip.innerHTML = jsObject.balance + ' 元';
					}else{
						msgtip.innerHTML = '查询失败';
					}
				}else{
					msgtip.innerHTML = '正在查询余额,请稍候...';
				}
			}
		);
	},
	completeSubmit : function()
	{
		var objForm = document.completeForm;
		if(objForm.money.value=='' && objForm.money.value==0)
		{
			alert("请填写提现金额！");
			return false;
		}
		var postData = "member_id=" + objForm.member_id.value + "&member_name=" + str_encode(objForm.member_name.value) + "&apply_id=" + objForm.apply_id.value+ "&money=" + objForm.money.value + "&remarks=" + str_encode(objForm.remarks.value);
		Zhiwo.Ajaxhttp.postR(
			'/financial/takeaway/complete',
			function(data){
				var msgtip = gid("DialogContent");
				if(data){
					if(data == 'succ'){
						msgtip.innerHTML = '<p style="font-size:14px;color:green;text-align:center"><br /><br />提现完成！</p>';
						window.setTimeout(Zhiwo.DialogBox.DialogHide, 2000);
						window.setTimeout("self.location.reload();", 1000);
					}else if(data == 'checking'){
                        msgtip.innerHTML = '<p style="font-size:14px;color:green;text-align:center"><br /><br />未受理订单不能执行此操作！</p>';
                        window.setTimeout(Zhiwo.DialogBox.DialogHide, 2000);
                        window.setTimeout("self.location.reload();", 1000);
                    }else if(data == 'lacking'){
						msgtip.innerHTML = '<p style="font-size:14px;color:green;text-align:center"><br /><br />余额不足，不能完成本次提现申请！</p>';
						window.setTimeout(Zhiwo.DialogBox.DialogHide, 2000);
						window.setTimeout("self.location.reload();", 1000);
					}else{
						msgtip.innerHTML = '<p style="font-size:14px;color:red;text-align:center"><br /><br />提交失败！</p>';
					}
				}
				else{
					msgtip.innerHTML = '<p style="font-size:14px;color:#000;text-align:center"><br /><br />正在提交中,请稍候...</p>';
				}
			},
			postData
		);
	},
	close : function()
	{
		Zhiwo.DialogBox.DialogHide();
	}
	
}