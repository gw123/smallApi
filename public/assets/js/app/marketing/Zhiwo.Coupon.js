if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};
Zhiwo.Coupon = {
	downloadBox : function(couponId, couponType, couponName){
		if(couponId == '' || couponType == '') {
			alert("券ID或券类型为空！");
			return false;
		}
		var dialogtitle = '下载'+couponType+'类优惠券';
		var msgBody='<table width="96%">';
		msgBody+='<tr><td width="80" align="right">优惠券名称:</td><td width="260" align="left">'+couponName+'</td></tr>';
		msgBody+='<tr><td width="80" align="right">下载数量:</td><td width="260" align="left"><input type="text" name="coupon_num" id="coupon_num" maxlength="4" size="5" value="1" /></td></tr>';
		msgBody+='<tr><td width="80" align="right">券码格式:</td><td width="260" align="left"><select name="code_format" id="code_format"><option value="0" selected>字母与数字混合</option><option value="1">纯字母</option><option value="2">纯数字</option></select></td></tr>';
		msgBody+='</table>';
		msgBody+='<table class="noborder" width="96%"><tr><td>';
		msgBody+='<input type="hidden" id="coupon_id" name="coupon_id" value="'+couponId+'" />';
		msgBody+='<input type="hidden" id="coupon_type" name="coupon_type" value="'+couponType+'" />';
		msgBody+='<input  type="button" name="download" id="download_btn" onClick="Zhiwo.Coupon.downloadConfirm();" value="下 载" />&nbsp;&nbsp;&nbsp;&nbsp;';
		msgBody+='<input  type="button" name="close" onClick="Zhiwo.DialogBox.DialogHide();" value="返 回" /></td></tr></table>';
		Zhiwo.DialogBox.DialogShow(dialogtitle,msgBody,520,400,500,260);
	},
	downloadConfirm : function(){
		var couponId = gid('coupon_id').value;
		var couponType = gid('coupon_type').value;
		var codeFormat = gid('code_format').value;
		var couponNum = parseInt(gid('coupon_num').value);
		if(couponNum > 2000){
			alert('一次下载'+couponNum+'张优惠券有点多，请分批下载!');
			return false;
		}else if(couponNum <= 0){
			alert('请输入要下载优惠券的数量！');
			return false;
		}else{
			if(couponType == 'A' && couponNum > 1){
				couponNum = 1;
				alert('A类券只能下载一张！');
				return false;
			}
			gid('download_btn').disabled = true;
			var url = '/marketing/coupon/download?coupon_id=' + couponId + '&coupon_num=' + couponNum + '&code_format=' + codeFormat;
			setTimeout(Zhiwo.DialogBox.DialogHide, 500);
			setTimeout("location.href='"+url+"'", 1000);
			
		}
	},
	
	deliveryBox : function(couponId, couponType, couponName){
		if(couponId == '' || couponType == ''){
			alert("券ID或券类型为空！");
			return false;
		}
		var dialogtitle = '发送'+couponType+'类优惠券';
		var msgBody='<table width="96%">';
		msgBody+='<tr><td width="80" align="right">优惠券名称:</td><td width="260" align="left">'+couponName+'</td></tr>';
		msgBody+='<tr><td width="80" align="right">发送用户名:</td><td width="260" align="left"><textarea name="member_name" id="member_name" cols="50" rows="8"></textarea><br /><span style="color:red">多个用户名用 | 竖线分隔</span></td></tr>';
		msgBody+='<tr><td width="80" align="right">发送数量:</td><td width="260" align="left"><input type="text" name="coupon_num" id="coupon_num" maxlength="2" size="5" value="1" /></td></tr>';
		msgBody+='<tr><td width="80" align="right">券码格式:</td><td width="260" align="left"><select name="code_format" id="code_format"><option value="0" selected>字母与数字混合</option><option value="1">纯字母</option><option value="2">纯数字</option></select></td></tr>';
		msgBody+='</table><div id="showMsg"></div>';
		msgBody+='<table class="noborder" width="96%"><tr><td>';
		msgBody+='<input type="hidden" id="coupon_id" name="coupon_id" value="'+couponId+'" />';
		msgBody+='<input type="hidden" id="coupon_type" name="coupon_type" value="'+couponType+'" />';
		msgBody+='<input  type="button" name="download" id="delivery_btn" onClick="Zhiwo.Coupon.deliveryConfirm();" value="发 送" />&nbsp;&nbsp;&nbsp;&nbsp;';
		msgBody+='<input  type="button" name="close" onClick="Zhiwo.DialogBox.DialogHide();" value="返 回" /></td></tr></table>';
		Zhiwo.DialogBox.DialogShow(dialogtitle,msgBody,700,500,650,350);
	},
	deliveryConfirm : function(){
		var couponId = gid('coupon_id').value;
		var couponType = gid('coupon_type').value;
		var codeFormat = gid('code_format').value;
		var couponNum = parseInt(gid('coupon_num').value);
		var memberName = gid('member_name').value;
		if(couponNum <= 0 || couponNum > 10){
			alert('发送数量只能输入1-10之间的数字！');
			return false;
		}else if(couponType == 'A'){
			alert('只能发送B、C、D、E类的优惠券！');
			return false;
		}else if(memberName == ''){
			alert('请填写发送用户名！');
			return false;
		}else{
			gid('delivery_btn').disabled = true;
			var postData = 'member_name=' + memberName + '&coupon_id=' + couponId + '&coupon_num=' + couponNum + '&code_format=' + codeFormat;
			Zhiwo.Ajaxhttp.postR(
				'/marketing/coupon/delivery',
				function(data){
					var msgtip = gid("DialogContent");
					if(data){
						var jsObject = eval('('+data+')');
						msgtip.innerHTML = '<font color="green"><br /><br />'+jsObject.msg+'</font>';
						//setTimeout(Zhiwo.DialogBox.DialogHide, 2000);
						//setTimeout("self.location.reload();", 1000);
					}else{
						msgtip.innerHTML = '<font color="red"><br /><br />正在发送中,请稍候...</font>';
					}
				},
				postData
			);
		}
	}
}