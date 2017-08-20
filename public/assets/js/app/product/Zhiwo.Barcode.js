/*!
 *
 * 条码管理
 * @package		Barcode
 * @author		zhaoshunyao
 * @date		2012/09/03
 */

if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};

Zhiwo.Barcode  = {
	//打印机设置
	printerList: [],
	getPrinterList : function()
	{
		var printerCount = LODOP.GET_PRINTER_COUNT();
		for(var i=0;i<printerCount;i++)
		{
			Zhiwo.Barcode.printerList[i] = LODOP.GET_PRINTER_NAME(i);
		}
	},
	
	setPrinter : function()
	{
		Zhiwo.Barcode.getPrinterList();
		
		var htmlTable;
		var printerOption = '';
		for(var i=0;i<Zhiwo.Barcode.printerList.length;i++)
		{
			printerOption += '<option value="'+Zhiwo.Barcode.printerList[i]+'">'+Zhiwo.Barcode.printerList[i]+'</option>';
		}
		htmlTable = '<form name="printerForm" action="return false;" method="post"><table class="noborder" width="98%">';
		htmlTable += '<tr><td height="30" valign="top">条形码打印机已绑定为 “'+barcodePrinter+'”&nbsp;&nbsp; &gt&gt重选 <select name="barcode_printer" size="1">'+printerOption+'</select></td></tr>';
		htmlTable += '<tr><td height="20"><div id="printerMsg"></div></td></tr>';
		htmlTable += '<tr><td height="20"><input name="save" type="button" class="bnsrh" onClick="Zhiwo.Barcode.savePrinter();" value="保 存" />&nbsp;&nbsp; &nbsp;&nbsp;';
		htmlTable += '<input name="close" type="button" class="bnsrh" onClick="Zhiwo.Barcode.close();" value="返 回" /></td></tr>';
		htmlTable += '</table></form>';

		Zhiwo.DialogBox.DialogShow('绑定打印机',htmlTable,610,200,600,180);
	},

	savePrinter : function()
	{
		var objForm = document.printerForm;
		var msgtip = document.getElementById("printerMsg");
		if(objForm.barcode_printer.value == '' || objForm.barcode_printer.value == null) {
			msgtip.innerHTML = '<font color="red">保存失败！要绑定的打印机为空！</font>';
			return false;
		}
		//保存到全局变量
		barcodePrinter = objForm.barcode_printer.value;
		var postData = "barcode_printer=" + objForm.barcode_printer.value;
		Zhiwo.Ajaxhttp.postR(
			'/sys/settings/printer',
			function(data) {
				if(data) {
					if(data == 'succ') {
						msgtip.innerHTML = '<font color="green">保存成功！</font>';
					} else {
						msgtip.innerHTML = '<font color="red">保存失败！</font>';
					}
				} else {
					msgtip.innerHTML = '<font color="red">正在保存设置,请稍候...</font>';
				}
			},
			postData
		);
	},

	singleUpdate : function(pid,sku,name,barcode)
	{
		var htmlTable;
		htmlTable = '<form name="updateBarcodeForm" method="post" onsubmit="return false;">';
		htmlTable += '<input name="product_id" type="hidden" value="'+pid+'" />';
		htmlTable += '<table class="noborder" width="98%">';
		htmlTable += '<tr><td width="120" height="30" align="right">sku号：</td><td align="left">'+sku+'</td></tr>';
		htmlTable += '<tr><td width="120" height="30" align="right">货品名：</td><td align="left">'+name+'</td></tr>';
		htmlTable += '<tr><td width="120" height="30" align="right">条 码：<td	align="left"><input name="barcode" type="text" size="16" maxlength="13" value="'+barcode+'" autocomplete="off" /></td></tr>';
		htmlTable += '<tr><td width="120" height="30" align="right">自建条码：<td align="left"><input name="diybarcode" type="checkbox" value="yes" />是 <span style="color:red;">(注意：自建将覆盖原条码)</span></td></tr>';
		htmlTable += '<tr><td width="120" height="30">&nbsp;</td><td align="left"><input name="save" type="button" class="bnsrh" onClick="Zhiwo.Barcode.saveSingleUpdate();" value="修 改" />&nbsp;&nbsp; &nbsp;&nbsp;';
		htmlTable += '<input name="close" type="button" class="bnsrh" onClick="Zhiwo.Barcode.close();" value="返 回" /></td></tr>';
		htmlTable += '</table></form>';
		Zhiwo.DialogBox.DialogShow('修改货品条码',htmlTable,700,400,600,300);
	},

	saveSingleUpdate : function()
	{
		var objForm = document.updateBarcodeForm;
		var postData = "products[]=" + objForm.product_id.value + "|" + str_encode(objForm.barcode.value) + "|";
		if(objForm.diybarcode.checked == true) {postData += objForm.diybarcode.value;}
		Zhiwo.Ajaxhttp.postR(
			'/product/barcode/update',
			function(data) {
				if(data) {
					var jsObject = eval('('+data+')');
					var msg = "";
					if(jsObject.message.length) {
						for(var i=0;i<jsObject.message.length;i++) {
							msg += jsObject.message[i] + "\n";
						}
					}
					if(jsObject.errorno == 0) {
						alert('修改条码成功');
					} else {
						alert("修改条码失败\n\n"+msg);
					}
					Zhiwo.Barcode.close();
					window.location.reload();
				}
			},
			postData
		);
	},

	singlePrint : function(pid,sku,name,barcode)
	{
		var htmlTable;
		htmlTable = '<form name="printBarcodeForm" method="post" onsubmit="return false;">';
		htmlTable += '<input name="product_id" type="hidden" value="'+pid+'" />';
		htmlTable += '<table class="noborder" width="98%">';
		htmlTable += '<tr><td width="120" height="30" align="right">sku号：</td><td align="left">'+sku+'</td></tr>';
		htmlTable += '<tr><td width="120" height="30" align="right">货品名：</td><td align="left">'+name+'</td></tr>';
		htmlTable += '<tr><td width="120" height="30" align="right">条 码：<td align="left"><input name="barcode" type="text" size="14" maxlength="13" value="'+barcode+'" readOnly="readOnly" /></td></tr>';
		htmlTable += '<tr><td width="120" height="30" align="right">打印数量：<td align="left"><input name="quantity" type="text" size="14" maxlength="4" value="1" /></td></tr>';
		htmlTable += '<tr><td width="120" height="30">&nbsp;</td><td align="left"><input name="save" type="button" class="bnsrh" onClick="Zhiwo.Barcode.confirmPrint();" value="打 印" />&nbsp;&nbsp; &nbsp;&nbsp;';
		htmlTable += '<input name="close" type="button" class="bnsrh" onClick="Zhiwo.Barcode.close();" value="返 回" /></td></tr>';
		htmlTable += '</table></form>';
		Zhiwo.DialogBox.DialogShow('打印货品条码',htmlTable,700,400,600,300);
	},

	confirmPrint : function()
	{
		var objForm = document.printBarcodeForm;
		var postData = "products[]=" + objForm.product_id.value + "|" + objForm.quantity.value;
		Zhiwo.Ajaxhttp.postR(
			'/product/barcode/print',
			function(data) {
				if(data) {
					var jsObject = eval('('+data+')');
					if(jsObject.errorno == 0 && jsObject.barcodes.length > 0) {
						for(var i = 0; i < jsObject.barcodes.length; i++) {
							for(var j = 0; j < jsObject.barcodes[i].quantity; j++) {
								LODOP.PRINT_INITA(0,0,"41mm","20mm","");
								var ret = LODOP.SET_PRINTER_INDEXA(barcodePrinter);
								if(!ret) {
									alert("打印机绑定失败");
									return false;
								}
								LODOP.ADD_PRINT_BARCODE(-10,118,100,70,"EAN13",jsObject.barcodes[i].barcode);
								LODOP.SET_PRINT_STYLEA(0,"FontSize",7);
								LODOP.PRINT();
							}
						}
						alert(jsObject.total+'个条码数据已发送到打印机');
					} else {
						alert("打印条码失败");
					}
					Zhiwo.Barcode.close();
				}
			},
			postData
		);
	},
	
	selectAll : function(pnode, checkItem)
	{
		var pnode = document.getElementById(pnode);
		var des = document.getElementsByName(checkItem);
		for(var i=0;i<des.length;i++)
		{
			if(des[i].disabled==true) continue;
			if(des[i].checked = pnode.checked){}
		}
	},
	close : function()
	{
		Zhiwo.DialogBox.DialogHide();
	}
}