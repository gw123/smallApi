/*!
 *
 * 分配快递
 * @package		SortExpress
 * @author		zhaoshunyao
 * @date		2015/01/04
 */

if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};

Zhiwo.SortExpress  = {

	//分配快递确认
	confirm : function() {
		var deliveryCompany = getSelectValue('delivery_company');
		if(deliveryCompany == "" || deliveryCompany == null) {
			alert("请选择快递公司！");
			return false;
		}
		var orderNum = 0;
		
		var postData = 'delivery_company=' + str_encode(deliveryCompany);
		var orderIds = document.getElementsByName('orderIds[]');
		if(orderIds == null) return false;
		for(var i = 0; i < orderIds.length; i++) {
			if(orderIds[i].checked) {
				orderNum++;
				postData += "&order_id[]=" + orderIds[i].value;
			}
		}
		if(orderNum <= 0) {
			alert("请选择要分配的订单！");
			return false;
		}

		Zhiwo.Ajaxhttp.postR(
			'/storage/delivery/sortexpressconfirm', 
			function(data) {
				if(data) {
					if(data == 'succ') {
						alert('分配成功');
					} else {
						alert('分配失败');
					}
					Zhiwo.SortExpress.close();
					window.location.reload();
				}
			},
			postData
		);
	},
	
	setDeliveryCompany : function(orderId, deliveryCompany) {
		var htmlTable = '';
		var companyArray = ['圆通速递','申通快递','中通速递','EMS邮政速递','宅急送_已付','宅急送','微特派','圆通货到付款','百世快递'];
		var companyOptions = '';
		for(var i = 0; i < companyArray.length; i++) {
			if (companyArray[i] == deliveryCompany) {
				companyOptions += '<option value="'+companyArray[i]+'" selected>'+companyArray[i]+'</option>';
			} else {
				companyOptions += '<option value="'+companyArray[i]+'">'+companyArray[i]+'</option>';
			}
		}
		
		htmlTable = '<form name="updateDeliveryForm" action="return false;" method="post">';
		htmlTable += '<input name="order_id" type="hidden" value="'+orderId+'" />';
		htmlTable += '<table class="noborder" width="98%">';
		htmlTable += '<tr><td width="120" height="30" align="right">订单号：</td><td align="left">'+orderId+'</td></tr>';
		htmlTable += '<tr><td width="120" height="30" align="right">已分配快递：</td><td align="left">'+deliveryCompany+'</td></tr>';
		htmlTable += '<tr><td width="120" height="30" align="right"><span style="color:red">*</span>重新分配快递：<td align="left"><select name="delivery_company">'+companyOptions+'</select></td></tr>';
		htmlTable += '<tr><td width="120" height="30">&nbsp;</td><td align="left"><input name="save" type="button" onClick="Zhiwo.SortExpress.saveDeliveryCompany();" value="确 定" />&nbsp;&nbsp; &nbsp;&nbsp;';
		htmlTable += '<input name="close" type="button" onClick="Zhiwo.SortExpress.close();" value="返 回" /></td></tr>';
		htmlTable += '</table></form>';
		Zhiwo.DialogBox.DialogShow('分配快递',htmlTable,700,400,450,320);
	},

	saveDeliveryCompany : function() {
		var objForm = document.updateDeliveryForm;
		var postData = "order_id=" + objForm.order_id.value + "&delivery_company=" + str_encode(objForm.delivery_company.value);
		Zhiwo.Ajaxhttp.postR(
			'/storage/delivery/anewsortexpress',
			function(data) {
				if(data) {
					if(data == 'succ') {
						alert('分配成功');
					} else {
						alert('分配失败');
					}
					Zhiwo.SortExpress.close();
					window.location.reload();
				}
			},
			postData
		);
	},
	
	selectAll : function(pnode, checkItem) {
		var pnode = document.getElementById(pnode);
		var des = document.getElementsByName(checkItem);
		for(var i=0;i<des.length;i++) {
			if(des[i].disabled==true) continue;
			if(des[i].checked = pnode.checked){}
		}
	},
	close : function() {
		Zhiwo.DialogBox.DialogHide();
	}
}