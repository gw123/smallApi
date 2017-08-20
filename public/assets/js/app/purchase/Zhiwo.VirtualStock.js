/*!
 *
 * 虚拟库存调整
 * @package		VirtualStock
 * @author		zhaoshunyao
 * @date		2012/03/25
 */

if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};

Zhiwo.VirtualStock  = {
	openLogBox : function(sku)
	{
		var dialogTitle = '货品: “'+sku+'” 虚拟库存操作明细';
		var msgBody;
		msgBody='<iframe frameborder=0 width=600 height=380 marginheight=0 marginwidth=0 scrolling="no" src="/purchase/virtual/view?sku='+sku+'"></iframe>';
		Zhiwo.DialogBox.DialogShow(dialogTitle,msgBody,800,350,760,400);
	},

	searchProducts : function(sku,house_code)
	{
		var postData = 'sku=' + sku + '&house_code=' + house_code;
		Zhiwo.Ajaxhttp.postR(
			'/purchase/virtual/ajax/select/products',
			function(data) {
				var msgtip = gid("showMsg");
				if(data) {
					var jsObject = eval('('+data+')');
					if(jsObject.sku != '') {
						gid("product_name").innerHTML = jsObject.product_name;
						gid("real_stock").innerHTML = jsObject.real_stock;
						gid("virtual_stock").innerHTML = jsObject.virtual_stock;
						msgtip.innerHTML = '';
					} else {
						msgtip.innerHTML = '<font color="red"><br />未查询到任何结果！</font>';
					}
				} else {
					msgtip.innerHTML = '<font color="red"><br />正在查询,请稍候...</font>';
				}
			},
			postData
		);
	},
	
	updateBox : function(optype,sku,house_code)
	{
		var dialogtitle = '';
		var msgBody = '';
		msgBody='<table width="96%">';
		msgBody+='<tr><td width="60">SKU</td><td width="300">货品名</td><td width="60">实库存</td><td width="60">虚库存</td><td width="60">调整数量</td></tr>';
		msgBody+='<tr><td>'+sku+'</td><td width="300" id="product_name">&nbsp;</td><td id="real_stock">&nbsp;</td><td id="virtual_stock">&nbsp;</td>';
		if(optype == 'in'){
			msgBody+='<td> + <input type="text" name="option_stock" id="option_stock" size="4" value="" /></td></tr>';
		}else{
			msgBody+='<td> - <input type="text" name="option_stock" id="option_stock" size="4" value="" /></td></tr>';
		}
		msgBody+='</table><div id="showMsg"></div>';
		msgBody+='<table class="noborder" width="96%"><tr><td>';
		msgBody+='<input type="hidden" name="optype" id="optype" value="'+optype+'" />';
		msgBody+='<input type="hidden" name="sku" id="sku" value="'+sku+'" />';
		msgBody+='<input type="hidden" name="house_code" id="house_code" value="'+house_code+'" />';
		msgBody+='<input name="save" type="button" onClick="Zhiwo.VirtualStock.saveStock();" value="保 存" />&nbsp;&nbsp;';
		msgBody+='<input name="close" type="button" onClick="Zhiwo.VirtualStock.close();" value="返 回" /></td></tr></table>';

		if(optype == 'in') dialogtitle = '虚拟入库';else dialogtitle = '虚拟出库';
		Zhiwo.DialogBox.DialogShow(dialogtitle,msgBody,700,400,680,260);
		
		Zhiwo.VirtualStock.searchProducts(sku,house_code);
	},

	createBox : function(houseCode)
	{
		if(houseCode == '' || houseCode == null || houseCode == 0) {
			alert("请选择要操作的仓库");
			return false;
		}
		var dialogtitle = '创建虚拟库存';
		var msgBody='<table width="96%">';
		msgBody+='<tr><td width="80" align="right">SKU:</td><td width="200" align="left"><input type="test" name="sku" id="sku" value="" maxlength="14" size="15" /></td></tr>';
		msgBody+='<tr><td width="80" align="right">数量:</td><td width="200" align="left"><input type="text" name="option_stock" id="option_stock" maxlength="5" size="4" value="" /></td></tr>';
		msgBody+='</table><div id="showMsg"></div>';
		msgBody+='<table class="noborder" width="96%"><tr><td>';
		msgBody+='<input type="hidden" id="optype" name="optype" value="in" />';
		msgBody+='<input type="hidden" id="house_code" name="house_code" value="'+houseCode+'" />';
		msgBody+='<input name="save" type="button" onClick="Zhiwo.VirtualStock.saveStock();" value="保 存" />&nbsp;&nbsp;';
		msgBody+='<input name="close" type="button" onClick="Zhiwo.VirtualStock.close();" value="返 回" /></td></tr></table>';

		Zhiwo.DialogBox.DialogShow(dialogtitle,msgBody,520,400,500,260);
	},
	
	saveStock : function()
	{
		var option_stock = gid("option_stock").value;
		if(option_stock == '') {alert("请填写要操作的库存数量！");return false;}
		
		var postString = 'sku='+gid("sku").value+'&house_code='+gid("house_code").value+'&stock='+option_stock+'&op='+ gid("optype").value;
		Zhiwo.Ajaxhttp.postR(
			'/purchase/virtual/ajax/save', 
			function(data)
			{
				var msgtip = gid("DialogContent");
				if(data)
				{
					if(data == 'ok')
					{
						msgtip.innerHTML = '<font color="green"><br /><br />提交成功！</font>';
						window.setTimeout(Zhiwo.DialogBox.DialogHide, 2000);
						window.setTimeout("self.location.reload();", 1000);
					}
					else
					{
						msgtip.innerHTML = '<font color="red"><br /><br />提交失败！</font>';
					}
				}
				else
				{
					msgtip.innerHTML = '<font color="red"><br /><br />正在提交中,请稍候...</font>';
				}
			},
			postString
		);
	},

	close : function()
	{
		Zhiwo.DialogBox.DialogHide();
	}
}