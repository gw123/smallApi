/**
京东发货管理
**/
if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};

Zhiwo.JdShipping = Zhiwo.JdShipping || {};

//显示订单号和物流单号
Zhiwo.JdShipping.showDeliveryNumber = function(){
	var deliveryCompany = getSelectValue('delivery_companty');
	if(deliveryCompany == "" || deliveryCompany == null)
	{
		alert("请选择物流公司！");
		return false;
	}
	
	var orderNum = 0;
	var params = '';
	var orderIds = document.getElementsByName('orderIds[]');
	if(orderIds == null) return false;
	for(var i = 0; i < orderIds.length; i++)
	{
		if(orderIds[i].checked)
		{
			orderNum++;
			params += "&orderIds[]=" + orderIds[i].value;
		}
	}
	if(orderNum <= 0)
	{
		alert("请选择要打印的订单！");
		return false;
	}
	con
	Zhiwo.Ajaxhttp.getR(
		'/storage/jdshipping/multiviewdeliverynubmer?'+params, 
		function(data)
		{
			if(data)
			{
				var jsObject = eval('('+data+')');
				if(jsObject.code != 0)
				{
					alert(jsObject.error_disc);
					return false;
				}
				if(jsObject.total > 0)
				{
					var htmlTable;
					htmlTable = '<div><strong>京东货到付款</strong></div>';
					htmlTable += '<form name="deliveryConfirmForm" action="return false;" method="post">';
					htmlTable += '<input id="confirmCompany" name="confirmCompany" type="hidden" value="京东货到付款" />';
					htmlTable += '<div style="width:890px; height:auto; overflow:hidden;">';
					for(var i=0;i<jsObject.rows.length;i++)
					{
						htmlTable += '<div style="width:120px; height:40px; padding:3px 2px 3px 2px; text-align:center; float:left">';
						htmlTable += '<input type="text" name="confirmOrderIds[]" size="14" value="'+jsObject.rows[i].order_id+'" readonly="readonly" /><input type="text" id="confirmDeliveryNumber_'+jsObject.rows[i].order_id+'" size="14" maxlength="13" value="'+jsObject.rows[i].deliveryId+'"  readonly="readonly" /></div>';
					}
					htmlTable += '</div></form>';
					htmlTable += '<table class="noborder" width="98%"><tr><td>';
					htmlTable += '<input name="submit" id="deliveryConfirmButton" type="button" onClick="Zhiwo.JdShipping.getDeliveryData();" value="确定打印" />&nbsp;&nbsp;';
					htmlTable += '<input name="close" type="button" onClick="Zhiwo.Shipping.close();" value="返 回" /></td></tr></table>';
			
					Zhiwo.DialogBox.DialogShow('打印物流单',htmlTable,900,520,900,500);
				}
				else
				{
					alert("没有符合发货条件的订单");
					return false;
				}
			}
		}
	);
};

Zhiwo.JdShipping.getDeliveryData = function(){
	//物流单
	var postData = '';
	var deliveryNumber = '';
	var deliveryCompany = document.getElementById('confirmCompany').value;
	var orderIds = document.getElementsByName('confirmOrderIds[]');
	var deliveryNumberArray = [];
	if(orderIds == null) return false;
	for(var i = 0; i < orderIds.length; i++){
		deliveryNumber = document.getElementById('confirmDeliveryNumber_'+orderIds[i].value).value;
		if(deliveryNumber == "" || deliveryNumber == null || deliveryCompany == "" || deliveryCompany == null){
			alert("有物流单号还空着，请核实填写");
			return false;
		}else{
			//检查是否有重复单号
			if(deliveryNumberArray.length > 0) {
				for(var j = 0; j < deliveryNumberArray.length; j++) {
					if(deliveryNumberArray[j] == deliveryNumber) {
						var k = j + 1;
						alert("物流单号不能重复，请查询后输入。（第"+k+"个单号重复）");
						return false;
					}
				}
			}
			deliveryNumberArray.push(deliveryNumber);
			postData += "&orders[]=" + orderIds[i].value + '|' + deliveryNumber;
			document.getElementById('print_status_2_'+orderIds[i].value).innerHTML = '1';
			document.getElementById('delivery_number_'+orderIds[i].value).innerHTML = deliveryNumber;
		}
	}
	document.getElementById('deliveryConfirmButton').disabled = true;
	Zhiwo.Ajaxhttp.postR(
		'/storage/jdshipping/printdelivery', 
		function(data){
			var complete = 0;
			var myDate = new Date();
			var myYear = myDate.getFullYear();
			var myMonth = parseInt(myDate.getMonth()) + 1;
			var myDay = myDate.getDate();
			if(data){
				var jsObject = eval('('+data+')');
				if(jsObject.total > 0){
					for(var i=0;i<jsObject.rows.length;i++){
						if(complete > 50) break;

						LODOP.PRINT_INIT("");
						var ret = LODOP.SET_PRINTER_INDEXA(jdDeliveryPrinter);
						if(!ret) break;
						
						Zhiwo.JdShipping.printDelivery(jsObject.rows[i]);
						
						LODOP.PRINT();
						complete++;
					}
					
					if(complete >= jsObject.total){
						alert("物流单已全部发送到打印机，请等待打印机完成工作。\n\n总计" + jsObject.total + "单");
					}else{
						alert("物流单没有全部发送到打印机，请检查打印机！\n\n总计" + jsObject.total + "单，已发送" + complete + "单");
						return false;
					}
				}
				else{
					alert("没有符合发货条件的订单！");
					return false;
				}
			}else{
				//
			}
		},
		postData
	);
}

//打印京东物流单
Zhiwo.JdShipping.printDelivery =  function(data){
	var myDate = new Date();
	var myYear = myDate.getFullYear();
	var myMonth = parseInt(myDate.getMonth()) + 1;
	var myDay = myDate.getDate();

	var printDate = myYear+'-'+zeroize(myMonth)+'-'+zeroize(myDay);

	var receiveInfo = '';
	receiveInfo += '<table style="font-family:黑体;font-size=9"><tr><td colspan="2" >收方信息</td></tr>';
	receiveInfo += '<tr><td >姓名:' + data.receive_name + '</td><td>电话:'+data.receive_mobile+'</td></tr>';
	receiveInfo += '<tr><td colspan="2">地址:'+data.receive_addr+'</td></tr></table>';

	var senderInfo = '';
	senderInfo += '<table style="font-family:黑体;font-size=9"><tr><td colspan="2">寄方信息</td></tr>';
	senderInfo += '<tr><td >姓名:卓成</td><td >电话:01052975728</td></tr>';
	senderInfo += '<tr><td colspan="2">地址:北京顺义区后沙峪地区沙峪铁匠营村 村委会东 斯特派物流9号库</td></tr></table>';

	LODOP.SET_PRINT_PAGESIZE(1,"112.7mm","123.7mm","");
	LODOP.SET_PRINT_STYLE("FontName",'黑体');
	LODOP.SET_PRINT_STYLE("FontSize",8);
	LODOP.ADD_PRINT_BARCODE("7mm","13mm","92mm","15mm","128A",data.delivery_number+'-1-1-');
	
	LODOP.ADD_PRINT_TABLE("23mm","5mm","73mm","20mm",receiveInfo);
	LODOP.ADD_PRINT_TABLE("43mm","5mm","73mm","20mm",senderInfo);
	
	
	LODOP.SET_PRINT_STYLE("FontSize",8);
	LODOP.ADD_PRINT_TEXT("25mm","75mm","25mm","5mm","代收金额");
	LODOP.SET_PRINT_STYLE("FontSize",11);
	LODOP.ADD_PRINT_TEXT("28mm","75mm","30mm","10mm","￥"+data.total_amount+"元");
	LODOP.SET_PRINT_STYLE("FontSize",24);
	LODOP.ADD_PRINT_TEXT("38mm","85mm","25mm","12mm","1/1");
	LODOP.SET_PRINT_STYLE("FontSize",8);
	LODOP.ADD_PRINT_TEXT("50mm","75mm","25mm","12mm","客户签字");
	LODOP.SET_PRINT_STYLE("FontSize",6);
	LODOP.ADD_PRINT_TEXT("62mm","65mm","25mm","4mm",printDate);

	LODOP.SET_PRINT_STYLE("FontSize",9);
	LODOP.ADD_PRINT_TEXT("68mm","40mm","50mm","7mm","运单号:"+data.delivery_number);
	
	LODOP.SET_PRINT_STYLE("FontSize",8);
	LODOP.ADD_PRINT_TABLE("73mm","5mm","73mm","20mm",receiveInfo);
	LODOP.ADD_PRINT_TABLE("93mm","5mm","73mm","20mm",senderInfo);
	LODOP.SET_PRINT_STYLE("FontSize",8);
	LODOP.ADD_PRINT_TEXT("73mm","75mm","25mm","5mm","代收金额");
	LODOP.SET_PRINT_STYLE("FontSize",11);
	LODOP.ADD_PRINT_TEXT("80mm","75mm","30mm","10mm","￥"+data.total_amount+"元");
	LODOP.SET_PRINT_STYLE("FontSize",6);
	LODOP.ADD_PRINT_TEXT("110mm","65mm","25mm","4mm",printDate);
}
	