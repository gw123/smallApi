
// 重置密码 
function resetpasswd(member_id) {
	var formstr = ['<br><table class="noborder">',
				'<tr><td>新密码:</td><td><input type="text" name="password"></td></tr>',
				'<tr><td>确认密码:</td><td><input type="text" name="password2"></td></tr></table>',
				'<input type="hidden" name="member_id" value="',member_id,'">'].join('');
	var str = '<form action="/member/resetpasswd" method="post" onsubmit="return ZW.formSubmit(this, \'resetpasswdHandle\')">'+formstr+'<input type="submit" style="display: none;" id="resetpasswdBtn"></form>';
	var dialog = KindEditor.dialog({
		width : 275,
		title : '重置密码',
		body : '<div id="">'+str+'</div>',
		closeBtn : {
			name : '关闭',
			click : function(e) {
				dialog.remove();
			}
		},yesBtn : {
			name : '确定',
			click : function(e) {
				$('#resetpasswdBtn').click();
			}
		},noBtn : {
			name : '取消',
			click : function(e) {
				dialog.remove();
			}
		}
	});	
} 

// 提现 
function withdrawDeposits(member_id, member_name) {
	var formstr = '<br /><form action="/financial/takeaway/apply" method="post" onsubmit="return ZW.formSubmit(this, \'withdrawBtnHandle\')">';
	formstr += '<table class="noborder">';
	formstr += '<tr><td width="80" align="right">用户名:</td><td>'+member_name+'</td></tr>';
	formstr += '<tr><td width="80" align="right">提现金额:</td><td><input type="text" name="money" size="10" maxlength="6" /></td></tr>';
	formstr += '<tr><td width="80" align="right">提现方式:</td><td><select name="pay_type"><option value="1">支付宝</option><option value="3">网银</option><option value="3">线下汇款</option></select></td></tr>';
	formstr += '<tr><td width="80" align="right">支付宝帐号:</td><td><input type="text" name="receive_account" size="20" maxlength="40" /></td></tr>';
	formstr += '<tr><td width="80" align="right">银行名称:</td><td><input type="text" name="bank_name" size="30" maxlength="16" /></td></tr>';
	formstr += '<tr><td width="80" align="right">银行帐户名:</td><td><input type="text" name="bank_account" size="30" maxlength="10" /></td></tr>';
	formstr += '<tr><td width="80" align="right">银行帐号:</td><td><input type="text" name="bank_number" size="30" maxlength="16" /></td></tr>';
	formstr += '<tr><td width="80" align="right">备注:</td><td><textarea name="remarks" rows="2" cols="26"></textarea></td></tr></table>';
	formstr += '<input type="hidden" name="member_id" value="'+member_id+'" /><input type="hidden" name="member_name" value="'+member_name+'" />';
	formstr += '<input type="submit" style="display: none;" id="withdrawBtn" /></form>';
	var dialog = KindEditor.dialog({
		width : 380,
		height : 350,
		title : '申请提现',
		body : '<div id="withdrawBox">'+formstr+'</div>',
		closeBtn : {
			name : '关闭',
			click : function(e) {
				dialog.remove();
			}
		},yesBtn : {
			name : '确定',
			click : function(e) {
				$('#withdrawBtn').click();
			}
		},noBtn : {
			name : '取消',
			click : function(e) {
				dialog.remove();
			}
		}
	});	
}

// 禁用会员
function disabledMember(a, resp){
	var href = a.attr('href'); 
	a.attr('href', href.replace('disabled', 'enabled'));
	a.attr('callback', 'enabledMember');
	a.html('<span style="color: green">启用</span>');
}

// 启用会员
function enabledMember(a, resp){
	var href = a.attr('href');
	a.attr('href', href.replace('enabled', 'disabled'));
	a.attr('callback', 'disabledMember');
	a.html('禁用');
}

// 添加会员等级
function addMemberLevel(){
	var formstr = ['<br><table class="noborder">',
			'<tr><td>*等级名称:</td><td><input type="text" name="levelname"></td><td>输入2-10个汉字，可以输入字母和数字，不允许输入特殊字符</td></tr>',
			'<tr><td>*是否默认:</td><td><input type="radio" name="default_lv" value="1">是<input type="radio" name="default_lv" value="0" checked="true">否</td><td>如果选择“是”，顾客注册商店会员成功时，初始等级为当前等级</td></tr>',
			'<tr><td>所需消费额:</td><td><input type="text" name="deposit"></td><td>按消费额升级时,会员消费额达到此标准会自动升为当前等级</td></tr>',
			'<tr><td>等级折扣率:</td><td><input type="text" name="dis_count"></td><td>该等级可以享受的折扣率</td></tr>',
			'<tr><td>所需积分:</td><td><input type="text" name="point"></td><td>按积分升级时,会员积分达到此标准会自动升为当前等级</td></tr>',
			'<tr><td>所需经验值:</td><td><input type="text" name="experience"></td><td>按经验值升级时,会员经验值达到此标准会自动升为当前等级</td></tr></table>'].join('');
	var str = '<form action="/member/grade/add" method="post" onsubmit="return ZW.formSubmit(this, \'addMemberLevelHandle\')">'+formstr+'<input type="submit" style="display: none;" id="addMemberLevelBtn"></form>';
	var dialog = KindEditor.dialog({
		width : 610,
		title : '添加会员等级',
		body : '<div id="">'+str+'</div>',
		closeBtn : {
			name : '关闭',
			click : function(e) {
				dialog.remove();
			}
		},yesBtn : {
			name : '确定',
			click : function(e) {
				$('#addMemberLevelBtn').click();
			}
		},noBtn : {
			name : '取消',
			click : function(e) {
				dialog.remove();
			}
		}
	});	
	var hasDefault = $('.is_default').length;
	if (hasDefault) {
		$('input[name=default_lv]').attr('disabled', true);
	}
}

// 修改等级
function editMemberLevel(t){
	var member_lv_id = t.getAttribute('member_lv_id');
	var name = t.getAttribute('name');
	var deposit = t.getAttribute('deposit');
	var dis_count = t.getAttribute('dis_count');
	var point = t.getAttribute('point');
	var experience = t.getAttribute('experience');
	var is_default = t.getAttribute('is_default');
	var is_disabled = t.getAttribute('is_disabled');
	var formstr = '<br><table class="noborder">';
		formstr += '<tr><td>*等级名称:</td><td><input type="text" name="levelname" value="'+name+'"></td></tr>';
		if (is_default == 1) {
			formstr += '<tr><td>*是否默认:</td><td><input type="radio" name="default_lv" value="1" checked="true">是<input type="radio" name="default_lv" value="0">否</td></tr>';
		} else {
			formstr += '<tr><td>*是否默认:</td><td><input type="radio" name="default_lv" value="1">是<input type="radio" name="default_lv" value="0" checked="true">否</td></tr>';
		}
		formstr += '<tr><td>等级折扣率:</td><td><input type="text" name="dis_count" value="'+dis_count+'"></td></tr>';
		formstr += '<tr><td>所需消费额:</td><td><input type="text" name="deposit" value="'+deposit+'"></td></tr>';
		formstr += '<tr><td>所需积分:</td><td><input type="text" name="point" value="'+point+'"></td></tr>';
		formstr += '<tr><td>所需经验值:</td><td><input type="text" name="experience" value="'+experience+'"></td></tr>';
		if (is_disabled == 'false') {
			formstr += '<tr><td>是否启用:</td><td><input type="radio" name="disabled" value="false" checked="true">启用<input type="radio" name="disabled" value="true">停用</td></tr></table>';
		} else {
			formstr += '<tr><td>是否启用:</td><td><input type="radio" name="disabled" value="false">启用<input type="radio" name="disabled" value="true" checked="true">停用</td></tr></table>';
		}
		formstr += '<input type="hidden" name="member_lv_id" value="'+member_lv_id+'">';
	var str = '<form action="/member/grade/edit" method="post" onsubmit="return ZW.formSubmit(this, \'editMemberLevelHandle\')">'+formstr+'<input type="submit" style="display: none;" id="editMemberLevelBtn"></form>';
	var dialog = KindEditor.dialog({
		width : 325,
		title : '修改会员等级',
		body : '<div id="">'+str+'</div>',
		closeBtn : {
			name : '关闭',
			click : function(e) {
				dialog.remove();
			}
		},yesBtn : {
			name : '确定',
			click : function(e) {
				$('#editMemberLevelBtn').click();
			}
		},noBtn : {
			name : '取消',
			click : function(e) {
				dialog.remove();
			}
		}
	});	
	var hasDefault = $('.is_default').length;
	if (hasDefault && is_default != 1) {
		$('input[name=default_lv]').attr('disabled', true);
	}
}

function resetpasswdHandle(form, resp){
	if (resp.errors) {
		alert(resp.errors);
	} else {
		alert(resp.content);
		window.location.reload();
	}
}

function withdrawBtnHandle(form, resp){
	if (resp.status == 'succ') {
		alert(resp.msg);
		window.location.reload();
	} else {
		alert(resp.msg);
	}
}

function addMemberLevelHandle(form, resp){
	if (resp.errors) {
		alert(resp.errors);
	} else {
		alert(resp.content);
		window.location.reload();
	}
}

function editMemberLevelHandle(form, resp){
	if (resp.errors) {
		alert(resp.errors);
	} else {
		alert(resp.content);
		window.location.reload();
	}
}