/*!
 *
 * 发货管理
 * @package		Shipping
 * @author		zhaoshunyao
 * @date		2012/05/13
 */

if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};

function viewOrder(grid_selector,gridId) {
	var row = jQuery(grid_selector).jqGrid( 'getRowData',gridId);
	return row;
}

function getSelectedRows(grid_selector) {
	var grid = $(grid_selector);
	var rowKey = grid.getGridParam("selrow");

	if (!rowKey)
		  return [];
	else {
		 var selectedIDs = grid.getGridParam("selarrrow");
		 var  rows = [];
		 for (var  i in selectedIDs)
		 {
			rows.push( viewOrder(grid_selector,selectedIDs[i]) );
		 }
		 console.log(rows);
	     return rows;
	}
}

Zhiwo.Shipping  = {
	//打印机设置
	printerList: [],
	getPrinterList : function()
	{
		var printerCount = LODOP.GET_PRINTER_COUNT();
		for(var i=0;i<printerCount;i++)
		{
			Zhiwo.Shipping.printerList[i] = LODOP.GET_PRINTER_NAME(i);
		}
	},

	setPrinter : function()
	{
		Zhiwo.Shipping.getPrinterList();

		var htmlTable;
		var printerOption = '';
		for(var i=0;i<Zhiwo.Shipping.printerList.length;i++)
		{
			printerOption += '<option value="'+Zhiwo.Shipping.printerList[i]+'">'+Zhiwo.Shipping.printerList[i]+'</option>';
		}

		htmlTable = '<form name="printerForm" action="return false;" method="post"><table class="noborder" width="98%">';
		htmlTable += '<tr><td height="50" valign="top">出库单打印机已绑定为 “'+outstoragePrinter+'”&nbsp;&nbsp; &gt&gt重选 <select name="outstorage_printer" size="1">'+printerOption+'</select></td></tr>';
		htmlTable += '<tr><td height="50" valign="top">物流单打印机已绑定为 “'+deliveryPrinter+'”&nbsp;&nbsp; &gt&gt重选 <select name="delivery_printer" size="1">'+printerOption+'</select></td></tr>';
		htmlTable += '<tr><td height="50" valign="top">京东物流单机已绑定为 “'+jdDeliveryPrinter+'”&nbsp;&nbsp; &gt&gt重选 <select name="jdDelivery_printer" size="1">'+printerOption+'</select></td></tr>';
		htmlTable += '<tr><td height="50" valign="top">发货单打印机已绑定为 “'+invoicePrinter+'”&nbsp;&nbsp; &gt&gt重选 <select name="invoice_printer" size="1">'+printerOption+'</select></td></tr>';
		htmlTable += '<tr><td height="20"><div id="PrinterMsg"></div></td></tr>';
		htmlTable += '<tr><td height="20"><input name="save" type="button" onClick="Zhiwo.Shipping.savePrinter();" value="保 存" />&nbsp;&nbsp; &nbsp;&nbsp;';
		htmlTable += '<input name="close" type="button" onClick="Zhiwo.Shipping.close();" value="返 回" /></td></tr>';
		htmlTable += '</table></form>';

		Zhiwo.DialogBox.DialogShow('绑定打印机',htmlTable,700,400,700,350);
	},

	savePrinter : function()
	{
		var objForm = document.printerForm;
		//保存到全局变量
		outstoragePrinter = objForm.outstorage_printer.value;
		deliveryPrinter = objForm.delivery_printer.value;
		//京东物流打印机
		jdDeliveryPrinter = objForm.jdDelivery_printer.value;
		invoicePrinter = objForm.invoice_printer.value;
		var postData = "outstorage_printer=" + objForm.outstorage_printer.value + "&jdDelivery_printer=" + objForm.jdDelivery_printer.value + "&delivery_printer=" + objForm.delivery_printer.value + "&invoice_printer=" + objForm.invoice_printer.value;
		Zhiwo.Ajaxhttp.postR(
			'/sys/settings/printer',
			function(data) {
				var msgtip = document.getElementById("PrinterMsg");
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

	getDate : function(format)
	{
		var myDate = new Date();
		var myYear = myDate.getFullYear();
		var myMonth = parseInt(myDate.getMonth()) + 1;
		var myDay = myDate.getDate();
		var myHour = myDate.getHours();
		var myMinute = myDate.getMinutes();
		var mySecond = myDate.getSeconds();
		var formatDate = myYear+'-'+zeroize(myMonth)+'-'+zeroize(myDay)+' '+ zeroize(myHour)+':'+zeroize(myMinute)+':'+zeroize(mySecond);
		return formatDate;
	},

	//打印出库单
	printSku : function()
	{
		var orders = getSelectedRows(grid_selector);
		var params = '';
		var orderNum =  0;
		var orderNo = 1;

		for(var i = 0; i < orders.length; i++) {
				params += '&orderNo['+orders[i].order_id+']=' + orderNo;
				//document.getElementById('print_status_1_'+orders[i].value).innerHTML = '1';
				orderNum++;
				orderNo++;
		}
		if(orderNum <= 0) {
			alert("请选择要打印的订单！");
			return false;
		}
		//console.log(params);
		var LODOP=getLodop(document.getElementById('LODOP_OB'),document.getElementById('LODOP_EM'));

		$.get(
			'/shipping/printsku?'+params,
			function(jsObject)
			{
				if(!jsObject)  alert('数据有误');

				if(jsObject.total > 0)
				{
					LODOP.PRINT_INITA(0,0,800,1200,"知我网_出库单");
					//LODOP.ADD_PRINT_TEXT(1,2,100,20,"Hello,World!");
					// var ret = LODOP.SET_PRINTER_INDEXA(outstoragePrinter);
					// if(!ret) return false;
					LODOP.ADD_PRINT_TEXT(30,310,260,30,"知我商城出库单");
					LODOP.SET_PRINT_STYLEA(1,"FontSize",16);
					LODOP.SET_PRINT_STYLEA(1,"Bold",1);

					//将数据拼成一个table
					var strTableStartHtml = '<table border="1" width="100%" cellpadding="0" cellspacing="0" align="center">';
					var strTableEndHtml = '</table>';
					var strTableTheadHtml = '<thead style="height: 26px">';
					strTableTheadHtml += '<td width="40" align="center" style="font-size: 13px;"><strong>序号</strong></td>';
					strTableTheadHtml += '<td width="70" align="center" style="font-size: 13px;"><strong>库位</strong></td>';
					strTableTheadHtml += '<td width="110" align="center" style="font-size: 13px;"><strong>SKU号</strong></td>';
					strTableTheadHtml += '<td width="250" align="center" style="font-size: 13px;"><strong>货品名称</strong></td>';
					strTableTheadHtml += '<td width="80" align="center" style="font-size: 13px;"><strong>货品条码</strong></td>';
					strTableTheadHtml += '<td width="50" align="center" style="font-size: 13px;"><strong>数量</strong></td>';
					strTableTheadHtml += '<td width="150" align="center" style="font-size: 13px;"><strong>订单序号=数量</strong></td>';
					strTableTheadHtml += '</thead>';
					var strTableTrHtml = '';

					var j = 1;
					for(var i=0;i<jsObject.rows.length;i++)
					{
						var td = '<tr style="height:23px;font-size:13px;">';
						td += '<td width="40" align="center">'+j+'</td>';
						td += '<td width="70" align="center">'+jsObject.rows[i].pos_name+'</td>';
						td += '<td width="110" align="center">'+jsObject.rows[i].sku+'</td>';
						td += '<td width="260" align="center">'+jsObject.rows[i].name+'</td>';
						td += '<td width="80" align="center">'+jsObject.rows[i].barcode+'</td>';
						td += '<td width="50" align="center">'+jsObject.rows[i].quantity+'</td>';
						td += '<td width="150" align="left" style="word-wrap:break-word;word-break:break-all;">'+jsObject.rows[i].order_list+'</td>';
						td += '</tr>';
						strTableTrHtml += td;
						j++;
					}
					var strPageFooter = "<tfoot style='height:26px;font-size:13px;'><td align='center'>合计</td><td align='center'>&nbsp;</td><td align='center'>&nbsp;</td><td align='center'>&nbsp;</td><td>&nbsp;</td><td tdata='subSum' format='#' align='center'><font color='#0000FF'>#</font></td><td>&nbsp;</td></tfoot>";

					LODOP.ADD_PRINT_TABLE(75,0,"100%","85%",strTableStartHtml + strTableTheadHtml + strTableTrHtml + strPageFooter + strTableEndHtml);
					var printDate = new Date().toLocaleString();
					LODOP.ADD_PRINT_TEXT(3,15,270,20,'本单打印于' + printDate);
					LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
					LODOP.SET_PRINT_STYLEA(0,"ItemType",1);
					LODOP.ADD_PRINT_TEXT(3,710,135,20,"第#页/共&页");
					LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
					LODOP.SET_PRINT_STYLEA(0,"ItemType",2);
					LODOP.SET_PRINT_STYLEA(0,"Horient",1);
					console.log("preview ")
					//LODOP.PRINT_DESIGN();
					LODOP.PREVIEW();
					ret = LODOP.PRINT();
					if(!ret)
					{
						alert("出库单打印失败！");
						return false;
					}
				}
				else
				{
					alert("没有符合出库条件的货品");
					return false;
				}

			}
		);
	},

	// 分配物流单
	assignDeliveryDisplay: function () {
		var orders = getSelectedRows(grid_selector);

		var tableContent = '';
		var tr = '<tr>\
			<td style="font-weight: 600"> 订单号 </td>    <td ><input type="hidden" class="deliveryOrderIds" name="deliveryOrderIds[]" value="{0}" > {0} </td>\
			<td style="font-weight: 600"> 物流公司 </td>  <td > {1} </td>\
			<td style="font-weight: 600"> 物流单号 </td>  <td > {2} </td>\
			</tr>';

		var orderIds = [];
		for(var i = 0; i < orders.length; i++)
		{
			tableContent += tr.format(orders[i].order_id , orders[i].delivery_company , orders[i].delivery_number  );
			orderIds.push(orders[i].order_id );
		}
		$( '#assignDeliveryModal .modal-body table') . html(tableContent);

	},

	assignDelivery : function () {

		var  orderIds = $("#deliveryOrderIdsFrom").serialize();
		var  deliveryCompany = $("#deliveryChannelSelect").val();
		orderIds+="&deliveryCompany="+deliveryCompany;
		$.get('/shipping/assignDeliveryNumber?'+orderIds ,function (response) {
			if(response.status!==1)
			{
				alert(response.msg); return;
			}
			var tableContent = '';
			orders = response.rows;
			var tr = '<tr>\
			<td style="font-weight: 600"> 订单号 </td>    <td ><input type="hidden" class="deliveryOrderIds" name="deliveryOrderIds[]" value="{0}" > {0} </td>\
			<td style="font-weight: 600"> 物流公司 </td>  <td > {1} </td>\
			<td style="font-weight: 600"> 物流单号 </td>  <td > {2} </td>\
			</tr>';

			var orderIds = [];
			for(var i = 0; i < orders.length; i++)
			{
				tableContent += tr.format(orders[i].order_id , orders[i].delivery_company , orders[i].delivery_number  );
				orderIds.push(orders[i].order_id );
			}
			$( '#assignDeliveryModal .modal-body table') . html(tableContent);
		});
	},

	//打印物流单
	printDelivery : function()
	{

		var LODOP=getLodop(document.getElementById('LODOP_OB'),document.getElementById('LODOP_EM'));

		var  orderIds = $("#deliveryOrderIdsFrom").serialize();
		var  deliveryCompany = $("#deliveryChannelSelect").val();
		orderIds+="&deliveryCompany="+deliveryCompany;
		$.get('/shipping/printDelivery?'+orderIds ,function (response) {
			if(response.status!=1)
			{ alert(response.msg); return}
			var orders = response.rows;
			var moban = $('#htmlContent')[0].outerHTML;

			var str = '';
			for( var i in orders)
			{
				 str = moban.format(orders[i]);
				//console.log (orders[i] ,str);
				LODOP.PRINT_INIT("国内小包");               //首先一个初始化语句
				LODOP.ADD_PRINT_HTM(0,0 ,1000,1000, str);
				LODOP.PREVIEW();                               //最后一个打印(或预览、维护、设计)语句
			}
		});

	},

	supplyDeliveryNumber : function()
	{
		var confirmCompany = document.getElementById('confirmCompany').value;
		var orderIds = document.getElementsByName('confirmOrderIds[]');
		if(orderIds == null) return false;
		if(confirmCompany == '宅急送' || confirmCompany == '宅急送_已付' || confirmCompany == '宅急送_好药师')
		{
			var firstStrNumber = '';
			var firstIntNumber = 0;
			var firstChar = '';
			var lastChar = '';
			var shipNumberObj;
			for(var i = 0; i < orderIds.length; i++)
			{
				shipNumberObj = document.getElementById('confirmDeliveryNumber_'+orderIds[i].value);
				if(i == 0)
				{
					if(shipNumberObj.value == "" || shipNumberObj.value == null)
					{
						alert("第一个物流单号不能为空");
						return false;
					}
					firstStrNumber = shipNumberObj.value;
					firstChar = Zhiwo.Shipping.getFirstChar(firstStrNumber);
					if(firstChar == '0')
					{
						firstIntNumber = parseInt(firstStrNumber.substr(1));
					}
					else
					{
						firstIntNumber = parseInt(firstStrNumber);
					}
				}
				else
				{
					lastChar = Zhiwo.Shipping.getLastChar(firstStrNumber);
					if(lastChar == '6')
					{
						firstIntNumber = firstIntNumber + 4;
					}
					else
					{
						firstIntNumber = firstIntNumber + 11;
					}
					firstStrNumber = firstIntNumber.toString();

					if(firstChar == '0')
					{
						firstStrNumber = '0' + firstStrNumber;
					}
					shipNumberObj.value = firstStrNumber;
				}
			}
		}
		else if(confirmCompany == '微特派')
		{
			var firstNumber = 0;
			var supplySize = parseInt(document.getElementById('supplySize').value);
			var shipNumberObj;
			for(var i = 0; i < orderIds.length; i++)
			{
				shipNumberObj = document.getElementById('confirmDeliveryNumber_'+orderIds[i].value);
				if(i == 0)
				{
					if(shipNumberObj.value == "" || shipNumberObj.value == null)
					{
						alert("第一个物流单号不能为空");
						return false;
					}
					firstNumber = parseInt(shipNumberObj.value.substr(1));
				}
				else
				{
					firstNumber = firstNumber + supplySize;
				}
				shipNumberObj.value = '0' + firstNumber;
			}
		}
		else
		{
			var firstNumber = 0;
			var supplySize = parseInt(document.getElementById('supplySize').value);
			var shipNumberObj;
			for(var i = 0; i < orderIds.length; i++)
			{
				shipNumberObj = document.getElementById('confirmDeliveryNumber_'+orderIds[i].value);
				if(i == 0)
				{
					if(shipNumberObj.value == "" || shipNumberObj.value == null)
					{
						alert("第一个物流单号不能为空");
						return false;
					}
					firstNumber = parseInt(shipNumberObj.value);
				}
				else
				{
					firstNumber = firstNumber + supplySize;
					shipNumberObj.value = firstNumber;
				}
			}
		}
	},

	printDeliveryConfirm : function()
	{
		//物流单
		var postData = '';
		var deliveryNumber = '';
		var deliveryCompany = document.getElementById('confirmCompany').value;
		var orderIds = document.getElementsByName('confirmOrderIds[]');
		var deliveryNumberArray = [];
		if(orderIds == null) return false;
		for(var i = 0; i < orderIds.length; i++)
		{
			deliveryNumber = document.getElementById('confirmDeliveryNumber_'+orderIds[i].value).value;
			if(deliveryNumber == "" || deliveryNumber == null || deliveryCompany == "" || deliveryCompany == null)
			{
				alert("有物流单号还空着，请核实填写");
				return false;
			}
			else
			{
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
				postData += "&orders[]=" + orderIds[i].value + '|' + deliveryNumber + '|' + str_encode(deliveryCompany);
				document.getElementById('print_status_2_'+orderIds[i].value).innerHTML = '1';
				document.getElementById('delivery_number_'+orderIds[i].value).innerHTML = deliveryNumber;
			}
		}
		document.getElementById('deliveryConfirmButton').disabled = true;
		Zhiwo.Ajaxhttp.postR(
			'/storage/shipping/printdelivery',
			function(data)
			{
				var complete = 0;
				var myDate = new Date();
				var myYear = myDate.getFullYear();
				var myMonth = parseInt(myDate.getMonth()) + 1;
				var myDay = myDate.getDate();
				if(data)
				{
					var jsObject = eval('('+data+')');
					if(jsObject.total > 0)
					{
						for(var i=0;i<jsObject.rows.length;i++)
						{
							if(complete > 50) break;

							LODOP.PRINT_INIT("");
							var ret = LODOP.SET_PRINTER_INDEXA(deliveryPrinter);
							if(!ret) break;

							if(deliveryCompany == '圆通速递')
							{
								Zhiwo.Shipping.YTODelivery(jsObject.rows[i]);
							}
							else if(deliveryCompany == '申通快递')
							{
								Zhiwo.Shipping.STODelivery(jsObject.rows[i]);
							}
							else if(deliveryCompany == '中通速递')
							{
								Zhiwo.Shipping.ZTODelivery(jsObject.rows[i]);
							}
							else if(deliveryCompany == '宅急送')
							{
								Zhiwo.Shipping.ZJSCODDelivery(jsObject.rows[i]);
							}
							else if(deliveryCompany == '宅急送_好药师')
							{
								Zhiwo.Shipping.ZJSCODHYSDelivery(jsObject.rows[i]);
							}
							else if(deliveryCompany == '宅急送_已付')
							{
								Zhiwo.Shipping.ZJSDelivery(jsObject.rows[i]);
							}
							else if(deliveryCompany == '微特派')
							{
								Zhiwo.Shipping.VTEPAIDelivery(jsObject.rows[i]);
							}
							else if(deliveryCompany == 'EMS邮政速递')
							{
								Zhiwo.Shipping.EMSDelivery(jsObject.rows[i]);
							}
							else if(deliveryCompany == 'EMS国内经济快递')
							{
								Zhiwo.Shipping.EMSEconomyDelivery(jsObject.rows[i]);
							}
							else if(deliveryCompany == '京东货到付款')
							{
								Zhiwo.Shipping.JDCODDelivery(jsObject.rows[i]);
							}
							else if(deliveryCompany == '百世快运')
							{
								Zhiwo.Shipping.BestDelivery(jsObject.rows[i]);
							}
							else
							{
								alert("物流方式不正确，无法匹配打印模板！");
								return false;
							}

							LODOP.PRINT();
							complete++;
						}

						if(complete >= jsObject.total)
						{
							alert("物流单已全部发送到打印机，请等待打印机完成工作。\n\n总计" + jsObject.total + "单");
						}
						else
						{
							alert("物流单没有全部发送到打印机，请检查打印机！\n\n总计" + jsObject.total + "单，已发送" + complete + "单");
							return false;
						}
					}
					else
					{
						alert("没有符合发货条件的订单！");
						return false;
					}
				}
				else
				{
					//
				}
			},
			postData
		);
	},

	getSenderName : function(channel)
	{
		//寄件人姓名
		if(channel == 'pinzhi365') {
			return '品质365';
		} else if(channel == 'davdian') {
			return '大V店-果敢时代';
		} else if(channel == 'gegejia') {
			return '格格家';
		} else {
			return '知我药妆';
		}
	},
	getSenderPhone : function(channel)
	{
		//寄件人电话
		if(channel == 'pinzhi365') {
			return '400-9987-365';
		} else if(channel == 'davdian') {
			return '010-52975728';
		} else if(channel == 'gegejia') {
			return '400-1603-602';
		} else {
			return '4006301018'; //知网电话
		}

	},
	YTODelivery : function(data)
	{
		//圆通模板
		var myDate = new Date();
		var myYear = myDate.getFullYear();
		var myMonth = parseInt(myDate.getMonth()) + 1;
		var myDay = myDate.getDate();
		var printDate = Zhiwo.Shipping.getDate();
		var senderName = Zhiwo.Shipping.getSenderName(data.order_channel);
		var senderPhone = Zhiwo.Shipping.getSenderPhone(data.order_channel);

		LODOP.SET_PRINT_PAGESIZE(1,"231mm","127mm","");
		LODOP.ADD_PRINT_TEXT(40,650,120,20,data.receive_city);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",15);

		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(85,100,100,20,senderName);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
		}

		LODOP.ADD_PRINT_TEXT(85,458,120,30,data.receive_name);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(90,578,200,20,printDate);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		LODOP.ADD_PRINT_TEXT(110,100,100,20,"朝阳");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		LODOP.ADD_PRINT_TEXT(110,200,260,40,data.order_id);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		LODOP.ADD_PRINT_TEXT(160,50,300,40,"重要客户，麻烦快递哥哥送达本人，谢谢");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		LODOP.ADD_PRINT_TEXT(138,415,345,40,data.receive_addr);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(185,130,120,20, senderPhone);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);
		}

		LODOP.ADD_PRINT_TEXT(185,490,150,20, data.receive_mobile);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",14);

		LODOP.ADD_PRINT_TEXT(205,490,145,20, data.receive_tel);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(360,215,100,20,senderName); //寄件人签名
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
		}

		LODOP.ADD_PRINT_TEXT(360,310,200,20, myYear + " " + myMonth + " " + myDay);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		LODOP.ADD_PRINT_TEXT(415,410,350,30, data.message);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	},

	STODelivery : function(data)
	{
		//申通模板
		var myDate = new Date();
		var myYear = myDate.getFullYear();
		var myMonth = parseInt(myDate.getMonth()) + 1;
		var myDay = myDate.getDate();
		var printDate = Zhiwo.Shipping.getDate();
		var senderName = Zhiwo.Shipping.getSenderName(data.order_channel);
		var senderPhone = Zhiwo.Shipping.getSenderPhone(data.order_channel);

		LODOP.SET_PRINT_PAGESIZE(1,"231mm","127mm","");

		LODOP.ADD_PRINT_TEXT(150,675,200,20,data.receive_city);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		//LODOP.ADD_PRINT_TEXT(130,100,100,20,"朝阳世贸");
		//LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(208,120,100,20,senderName);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
		}

		LODOP.ADD_PRINT_TEXT(130,200,260,40,data.order_id);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		LODOP.ADD_PRINT_TEXT(135,360,260,60,data.receive_addr);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		LODOP.ADD_PRINT_TEXT(210,415,120,20,data.receive_name);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(238,120,120,20, senderPhone);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);
		}

		LODOP.ADD_PRINT_TEXT(263,50,300,30, "重要客户，麻烦快递哥哥送达本人，谢谢");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",11);

		LODOP.ADD_PRINT_TEXT(240,380,150,20, data.receive_mobile);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",14);

		LODOP.ADD_PRINT_TEXT(240,530,140,40, data.receive_tel);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		LODOP.ADD_PRINT_TEXT(350,215,200,20, myMonth + "  " + myDay);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		LODOP.ADD_PRINT_TEXT(390,590,'5cm','0.5cm', printDate);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	},

	ZTODelivery : function(data)
	{
		//中通模板
		var myDate = new Date();
		var myYear = myDate.getFullYear();
		var myMonth = parseInt(myDate.getMonth()) + 1;
		var myDay = myDate.getDate();
		var senderName = Zhiwo.Shipping.getSenderName(data.order_channel);
		var senderPhone = Zhiwo.Shipping.getSenderPhone(data.order_channel);

		LODOP.SET_PRINT_PAGESIZE(1,"231mm","127mm","");

		LODOP.ADD_PRINT_TEXT(95,470,120,40,data.receive_name);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",14);

		LODOP.ADD_PRINT_TEXT(90,625,150,40,data.receive_city);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(130,215,200,40,data.order_id);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		LODOP.ADD_PRINT_TEXT(155,445,340,40,data.receive_addr);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(210,475,150,20, data.receive_mobile);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",14);

		LODOP.ADD_PRINT_TEXT(230,475,150,20, data.receive_tel);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		LODOP.ADD_PRINT_TEXT(376,65,200,20,myYear + "   " + myMonth + "   " + myDay);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
	},

	EMSDelivery : function(data)
	{
		//EMS模板
		var printDate = Zhiwo.Shipping.getDate();
		var senderName = Zhiwo.Shipping.getSenderName(data.order_channel);
		var senderPhone = Zhiwo.Shipping.getSenderPhone(data.order_channel);

		LODOP.SET_PRINT_PAGESIZE(1,"231mm","127mm","");
		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(86,265,120,20,senderPhone);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
		LODOP.ADD_PRINT_TEXT(115,115,200,20,senderName);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
		}

		LODOP.ADD_PRINT_TEXT(168,115,200,30,data.order_id);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		//寄件zip
		LODOP.ADD_PRINT_TEXT(168,307,150,15,"1  0  1  3  1  8");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		LODOP.ADD_PRINT_TEXT(203,115,120,40,data.receive_name);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(203,260,150,20, data.receive_mobile);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(230,260,200,20, data.receive_tel);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		LODOP.ADD_PRINT_TEXT(212,620,180,15,printDate);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		LODOP.ADD_PRINT_TEXT(246,100,330,30,data.receive_addr);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(300,105,150,20,data.receive_city);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		LODOP.ADD_PRINT_TEXT(307,330,150,15,data.receive_zip);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		//付款方式
		LODOP.ADD_PRINT_TEXT(338,520,15,20,"√");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",16);

		LODOP.ADD_PRINT_TEXT(355,640,110,50, data.message);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		//内件说明
		LODOP.ADD_PRINT_TEXT(387,153,15,20,"√");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",16);
	},

	EMSEconomyDelivery : function(data)
	{
		//EMS国内经济快递模板
		var printDate = Zhiwo.Shipping.getDate("Y-m-d H:i:s");
		var senderName = Zhiwo.Shipping.getSenderName(data.order_channel);
		var senderPhone = Zhiwo.Shipping.getSenderPhone(data.order_channel);

		LODOP.SET_PRINT_PAGESIZE(1,"231mm","127mm","");
		LODOP.ADD_PRINT_TEXT(85,112,100,40,"");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(85,250,120,20,senderPhone);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
		LODOP.ADD_PRINT_TEXT(110,115,200,20,senderName);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
		LODOP.ADD_PRINT_TEXT(165,110,150,20,data.order_id);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
		LODOP.ADD_PRINT_TEXT(165,645,120,20,senderName);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
		}
		//寄件zip
		LODOP.ADD_PRINT_TEXT(167,312,150,15,"1  0  1 3 1 8");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		LODOP.ADD_PRINT_TEXT(190,615,150,20,printDate);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		LODOP.ADD_PRINT_TEXT(202,95,150,20,data.receive_name);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);
		LODOP.ADD_PRINT_TEXT(202,270,150,20,data.receive_mobile);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);
		LODOP.ADD_PRINT_TEXT(220,270,150,20,data.receive_tel);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",11);

		LODOP.ADD_PRINT_TEXT(255,85,300,30,data.receive_addr);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
		LODOP.ADD_PRINT_TEXT(305,105,150,20,data.receive_city);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		//收件zip
		LODOP.ADD_PRINT_TEXT(308,315,150,15,data.receive_zip);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		//付款方式
		LODOP.ADD_PRINT_TEXT(323,429,15,20,"√");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",16);

		//用户留言
		LODOP.ADD_PRINT_TEXT(355,626,130,40, data.message);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	},

	ZJSDelivery : function(data)
	{
		//宅急送模板，已付
		var myDate = new Date();
		var myYear = myDate.getFullYear();
		var myMonth = parseInt(myDate.getMonth()) + 1;
		var myDay = myDate.getDate();
		var myHour = myDate.getHours();
		var myMinute = myDate.getMinutes();
		var mySecond = myDate.getSeconds();
		var printDate = myYear+'-'+zeroize(myMonth)+'-'+zeroize(myDay)+' '+ zeroize(myHour)+':'+zeroize(myMinute)+':'+zeroize(mySecond);
		var senderName = Zhiwo.Shipping.getSenderName(data.order_channel);
		var senderPhone = Zhiwo.Shipping.getSenderPhone(data.order_channel);

		LODOP.SET_PRINT_PAGESIZE(1,"231mm","139.7mm","");
		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(125,100,150,20,senderName);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",16);
		}

		LODOP.ADD_PRINT_TEXT(125,250,150,40,printDate);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		LODOP.ADD_PRINT_TEXT(160,100,150,30,data.order_id);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(220,80,120,20,senderPhone);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);
		}

		LODOP.ADD_PRINT_TEXT(260,110,120,20,data.receive_name);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(295,60,350,40,data.receive_addr);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(300,460,300,20,"请开箱验货，如有问题请拨打"+senderPhone);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
		}

		LODOP.ADD_PRINT_TEXT(320,460,300,30, data.message);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",11);

		LODOP.ADD_PRINT_TEXT(353,75,150,30, data.receive_tel);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(353,240,150,20, data.receive_mobile);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",14);

		LODOP.ADD_PRINT_TEXT(442,90,60,20,"化妆品");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
	},

	ZJSCODDelivery : function(data)
	{
		//宅急送模板,货到付款
		var myDate = new Date();
		var myYear = myDate.getFullYear();
		var myMonth = parseInt(myDate.getMonth()) + 1;
		var myDay = myDate.getDate();
		var myHour = myDate.getHours();
		var myMinute = myDate.getMinutes();
		var mySecond = myDate.getSeconds();
		var printDate = myYear+'-'+zeroize(myMonth)+'-'+zeroize(myDay)+' '+ zeroize(myHour)+':'+zeroize(myMinute)+':'+zeroize(mySecond);
		var senderName = Zhiwo.Shipping.getSenderName(data.order_channel);
		var senderPhone = Zhiwo.Shipping.getSenderPhone(data.order_channel);

		LODOP.SET_PRINT_PAGESIZE(1,"231mm","139.7mm","");
		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(125,100,150,20,senderName);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",16);
		}

		LODOP.ADD_PRINT_TEXT(125,250,150,40,printDate);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		LODOP.ADD_PRINT_TEXT(160,100,150,30,data.src_order_id);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(220,80,120,20,senderPhone);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);
		}

		LODOP.ADD_PRINT_TEXT(240,460,120,20,data.total_amount+"元");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",16);
		LODOP.SET_PRINT_STYLEA(0,"Bold",1);

		LODOP.ADD_PRINT_TEXT(260,110,120,20,data.receive_name);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(295,60,350,40,data.receive_addr);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(300,460,300,20,"请开箱验货，如有问题请拨打"+senderPhone);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
		}

		LODOP.ADD_PRINT_TEXT(320,460,300,30, data.message);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",11);

		LODOP.ADD_PRINT_TEXT(353,75,150,30, data.receive_tel);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(353,240,150,20, data.receive_mobile);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",14);

		LODOP.ADD_PRINT_TEXT(442,90,60,20,"化妆品");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
	},

	ZJSCODHYSDelivery : function(data)
	{
		//宅急送好药师模板,货到付款
		var myDate = new Date();
		var myYear = myDate.getFullYear();
		var myMonth = parseInt(myDate.getMonth()) + 1;
		var myDay = myDate.getDate();
		var myHour = myDate.getHours();
		var myMinute = myDate.getMinutes();
		var mySecond = myDate.getSeconds();
		var printDate = myYear+'-'+zeroize(myMonth)+'-'+zeroize(myDay)+' '+ zeroize(myHour)+':'+zeroize(myMinute)+':'+zeroize(mySecond);

		LODOP.SET_PRINT_PAGESIZE(1,"231mm","139.7mm","");
		LODOP.ADD_PRINT_TEXT(120,100,250,20,"京东订单号：" + data.src_order_id);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		LODOP.ADD_PRINT_TEXT(140,100,350,20,"3COD北京好药师大药房连销有限公司");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		LODOP.ADD_PRINT_TEXT(140,465,100,20,"6537848");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		LODOP.ADD_PRINT_TEXT(220,80,120,20,"4006301018"); //知网电话
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(220,498,10,10,"√");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",14);
		LODOP.SET_PRINT_STYLEA(0,"Bold",1);

		LODOP.ADD_PRINT_TEXT(240,460,120,20,data.total_amount+"元");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",16);
		LODOP.SET_PRINT_STYLEA(0,"Bold",1);

		LODOP.ADD_PRINT_TEXT(260,110,120,20,data.receive_name);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(295,60,350,40,data.receive_addr);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(405,440,150,20,printDate);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		LODOP.ADD_PRINT_TEXT(320,460,300,30, data.message);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",11);

		LODOP.ADD_PRINT_TEXT(353,75,150,30, data.receive_tel);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(353,240,150,20, data.receive_mobile);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",14);
	},

	VTEPAIDelivery : function(data)
	{
		//微特派
		var senderName = Zhiwo.Shipping.getSenderName(data.order_channel);
		var senderPhone = Zhiwo.Shipping.getSenderPhone(data.order_channel);

		LODOP.SET_PRINT_PAGESIZE(1,"231mm","127mm","");
		LODOP.ADD_PRINT_TEXT(60,435,80,25,"北京");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",15);

		LODOP.ADD_PRINT_TEXT(140,100,150,20,data.receive_name);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",14);

		LODOP.ADD_PRINT_TEXT(140,232,150,20,data.receive_mobile);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",14);

		LODOP.ADD_PRINT_TEXT(170,232,150,20,data.receive_tel);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		LODOP.ADD_PRINT_TEXT(210,80,270,40,data.receive_addr);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		LODOP.ADD_PRINT_TEXT(248,440,120,20,data.total_amount+"元");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",14);
		LODOP.SET_PRINT_STYLEA(0,"Bold",1);

		LODOP.ADD_PRINT_TEXT(271,347,10,10,"√");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",14);
		LODOP.SET_PRINT_STYLEA(0,"Bold",1);

		LODOP.ADD_PRINT_TEXT(285,100,120,20,data.order_id);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",11);

		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(317,90,120,20,senderName);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);
		LODOP.ADD_PRINT_TEXT(317,240,120,20,senderPhone);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);
		}

		LODOP.ADD_PRINT_TEXT(385,80,260,40,"北京市顺义区铁匠营村斯派特物流园9号库");
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		LODOP.ADD_PRINT_TEXT(390,395,300,30, data.message);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
	},

	BestDelivery : function(data)
	{
		//百世快运模板
		var myDate = new Date();
		var myYear = myDate.getFullYear();
		var myMonth = parseInt(myDate.getMonth()) + 1;
		var myDay = myDate.getDate();
		var printDate = Zhiwo.Shipping.getDate();
		var senderName = Zhiwo.Shipping.getSenderName(data.order_channel);
		var senderPhone = Zhiwo.Shipping.getSenderPhone(data.order_channel);

		LODOP.SET_PRINT_PAGESIZE(1,"231mm","127mm","");
		LODOP.ADD_PRINT_TEXT(42,652,120,20,data.receive_city);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",15);

		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(105,100,100,20,senderName);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
		}

		LODOP.ADD_PRINT_TEXT(105,275,100,20,'李育军');
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

		if(data.wholesale == 0) {
		LODOP.ADD_PRINT_TEXT(175,77,120,20, senderPhone);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);
		}

		LODOP.ADD_PRINT_TEXT(225,278,100,30,data.receive_name);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(249,75,300,40,data.receive_addr);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

		LODOP.ADD_PRINT_TEXT(300,65,120,20, data.receive_tel);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",13);

		LODOP.ADD_PRINT_TEXT(300,236,140,20, data.receive_mobile);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",14);

		LODOP.ADD_PRINT_TEXT(385,310,200,20, myYear + " " + myMonth + " " + myDay);
		LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	},

	//打印发货单
	printInvoice : function()
	{
		var orders = getSelectedRows(grid_selector);
		var params = '';
		var orderNum =  0;
		var orderNo = 1;

		for(var i = 0; i < orders.length; i++) {
			params += '&orderNo['+orders[i].order_id+']=' + orderNo;
			//document.getElementById('print_status_1_'+orders[i].value).innerHTML = '1';
			orderNum++;
			orderNo++;
		}
		if(orderNum <= 0) {alert("请选择要打印的订单！");return false;}
		//console.log(params);
		var LODOP=getLodop(document.getElementById('LODOP_OB'),document.getElementById('LODOP_EM'));

		$.get('/shipping/getPrintInvoiceData?'+params, function (response) {
			var complete = 0;
			var printDate = new Date().toLocaleDateString();
			if(response&&response.status==1)
			{
				var jsObject =response
				if(jsObject.total > 0)
				{
					for(var i=0;i<jsObject.rows.length;i++)
					{
						if(complete > 50) break;

						LODOP.PRINT_INIT("");
						// 指定打印机
						// var ret = LODOP.SET_PRINTER_INDEXA("Send To OneNote 2016");
						// if(!ret) break;

						if(jsObject.rows[i].goods_total > 10){
							LODOP.SET_PRINT_PAGESIZE(1,"210mm","280mm",""); //加纸
						}else{
							LODOP.SET_PRINT_PAGESIZE(1,"210mm","140mm","");
						}

						LODOP.ADD_PRINT_TEXT(40,220,200,22,"发货清单");
						LODOP.SET_PRINT_STYLEA(1,"FontSize",13);
						LODOP.SET_PRINT_STYLEA(1,"Bold",1);

						LODOP.ADD_PRINT_TEXT(65,20,170,20,"订单编号："+jsObject.rows[i].order_id);
						LODOP.SET_PRINT_STYLEA(2,"FontSize",9);
						LODOP.ADD_PRINT_TEXT(65,200,170,20,"发货日期："+printDate);
						LODOP.SET_PRINT_STYLEA(3,"FontSize",9);
						LODOP.ADD_PRINT_TEXT(65,370,120,20,"客户姓名："+jsObject.rows[i].receive_name);
						LODOP.SET_PRINT_STYLEA(4,"FontSize",9);

						if(jsObject.rows[i].wholesale == 1 || jsObject.rows[i].hide_price == 1)
						{
							//分销发货单[不显示价格]
							var strTableHtml = '<table border="1" width="480" cellpadding="1" cellspacing="0" align="center">';
							strTableHtml += '<thead style="height: 23px" bgcolor="#efefef">';
							strTableHtml += '<td width="300" align="center" style="font-size: 12px;">货品名称</td>';
							strTableHtml += '<td width="80" align="center" style="font-size: 12px;">库位</td>';
							strTableHtml += '<td width="80" align="center" style="font-size: 12px;">数量</td>';
							strTableHtml += '</thead>';

							var tr = '';
							var goodsList = jsObject.rows[i].goods_list;
							for(var j=0;j<goodsList.length;j++)
							{
								for(var k=0; k<goodsList[j].sku_list.length; k++)
								{
									tr += '<tr style="height: 20px;font-size: 11px;">';
									tr += '<td width="300" align="left">'+goodsList[j].sku_list[k].product_name+'</td>';
									tr += '<td width="80" align="center">'+goodsList[j].sku_list[k].pos_name+'</td>';
									tr += '<td width="80" align="center">'+goodsList[j].sku_list[k].product_num+'</td>';
									tr += '</tr>';
								}
							}
							strTableHtml += tr;
							strTableHtml += '<tr style="height: 20px;">';
							strTableHtml += '<td align="left" colspan="2" style="font-size: 11px;">&nbsp;&nbsp;留言：'+jsObject.rows[i].message+'</td>';
							strTableHtml += '<td align="left" style="font-size: 11px;">&nbsp;&nbsp;总件：'+jsObject.rows[i].goods_total+'</td>';
							strTableHtml += '<tr style="height: 20px;">';
							strTableHtml += '<td align="left" colspan="3" style="font-size: 11px;">&nbsp;&nbsp;备注：'+jsObject.rows[i].remarks+'</td>';
							strTableHtml += '</table>';
						}
						else
						{
							//常规发货单
							var strTableHtml = '<table border="1" width="480" cellpadding="1" cellspacing="0" align="center">';
							strTableHtml += '<thead style="height: 23px" bgcolor="#efefef">';
							strTableHtml += '<td width="240" align="center" style="font-size: 12px;">货品名称</td>';
							strTableHtml += '<td width="50" align="center" style="font-size: 12px;">库位</td>';
							strTableHtml += '<td width="50" align="center" style="font-size: 12px;">数量</td>';
							strTableHtml += '<td width="60" align="center" style="font-size: 12px;">单价</td>';
							strTableHtml += '<td width="80" align="center" style="font-size: 12px;">金额</td>';
							strTableHtml += '</thead>';

							var tr = '';
							var goodsList = jsObject.rows[i].goods_list;
							for(var j=0;j<goodsList.length;j++)
							{
								for(var k=0; k<goodsList[j].sku_list.length; k++)
								{
									tr += '<tr style="height: 20px;font-size: 11px;">';
									tr += '<td width="240" align="left">'+goodsList[j].sku_list[k].product_name+'</td>';
									tr += '<td width="50" align="center">'+goodsList[j].sku_list[k].pos_name+'</td>';
									tr += '<td width="50" align="center">'+goodsList[j].sku_list[k].product_num+'</td>';
									if (k==0) {
										tr += '<td rowspan='+goodsList[j].sku_total+' width="60" align="center">'+goodsList[j].price+'</td>';
										tr += '<td rowspan='+goodsList[j].sku_total+' width="80" align="center">'+goodsList[j].amount+'</td>';
									}
									tr += '</tr>';
								}
							}
							strTableHtml += tr;
							strTableHtml += '<tr style="height: 20px;">';
							strTableHtml += '<td align="left" colspan="3" style="font-size: 11px;">&nbsp;&nbsp;留言：'+jsObject.rows[i].message+'</td>';
							strTableHtml += '<td align="left" style="font-size: 11px;">&nbsp;&nbsp;总件：'+jsObject.rows[i].goods_total+'</td>';
							strTableHtml += '<td align="left" style="font-size: 11px;">&nbsp;&nbsp;运费：'+jsObject.rows[i].freight+'</td></tr>';
							strTableHtml += '<tr style="height: 20px;">';
							strTableHtml += '<td align="left" colspan="3" style="font-size: 11px;">&nbsp;&nbsp;备注：'+jsObject.rows[i].remarks+' '+jsObject.rows[i].src_order_id+'</td>';
							strTableHtml += '<td align="left" colspan="2" style="font-size: 11px;">&nbsp;&nbsp;总计金额：'+jsObject.rows[i].total_amount+'</td></tr>';
							strTableHtml += '</table>';
						}

						LODOP.ADD_PRINT_TABLE(90,5,500,"85%", strTableHtml);
						LODOP.PREVIEW();
						complete++;
					}

					if(complete >= jsObject.total)
					{
						alert("发货单已全部发送到打印机，请等待打印机完成工作。\n\n总计" + jsObject.total + "单。");
					}
					else
					{
						alert("发货单没有全部发送到打印机，请检查打印机！\n\n总计" + jsObject.total + "单，已发送" + complete + "单。");
						return false;
					}
				}
				else
				{
					alert("没有要发货的订单！");
					return false;
				}
			}
			else
			{
				//
			}
		});

	},

	examineGoods : function()
	{
		var orders = getSelectedRows(grid_selector);
		var params = '';
		var orderNum =  0;

		for(var i = 0; i < orders.length; i++) {
			params += '&orderNo[]=' + orders[i].order_id;
			//document.getElementById('print_status_1_'+orders[i].value).innerHTML = '1';
			orderNum++;
		}
		if(orderNum <= 0) {alert("请选择要打印的订单！");return false;}

		 window.location.href = '/shipping/examineDeliveryGoods?'+params
	},

	scanDeliveryNumber : function()
	{
		var deliveryNumber = document.scanForm1.delivery_number.value;
		if(deliveryNumber == "")
		{
			alert("请扫描物流单号！");
			return false;
		}
		return true;
	},

	scanSkuTotal : 0,
	scanBarcode : function()
	{
		var barcode = document.scanForm2.barcode.value;
		if(barcode == "")
		{
			$('#barcode_tips').html('请扫描货品条码！');
			return false;
		}
		Zhiwo.Shipping.scanSkuTotal++;

		var realObj = $('#skuList').find('#realQuantity-' + barcode);
		if(realObj && realObj.text())
		{
			var realQ = parseInt(realObj.text());
			var scanObj = $('#skuList').find('#scanQuantity-' + barcode);
			var scanQ = parseInt(scanObj.text()) + 1;
			scanObj.text(scanQ);

			if(realQ == scanQ)
			{
				$('#scanFlag-' + barcode).html('<span style="color:green;font-weight:bold">√</span>');
				$('#scanResult-' + barcode).val('T'); //扫描数量正确
			}
			else
			{
				$('#scanFlag-' + barcode).html('<span style="color:red;font-weight:bold">ㄨ</span>');
				$('#scanResult-' + barcode).val('F');	//扫描数量错误
			}
			$('#barcode_tips').html('<span style="color:green">扫描成功，“'+barcode+'”</span>');
			Zhiwo.Shipping.scanCheck();
		}
		else
		{
			$('#barcode_tips').html('<span style="color:red">扫描失败，“'+barcode+'”未匹配</span>');
		}

		document.scanForm2.barcode.value = '';
		return false;
	},

	scanCheck : function()
	{
		var skuObj = $('#skuList');
		var skuTotal = 0;
		var scanResult = '';
		skuObj.find('.skuItem').each(function() {
			var sku = $(this).attr('sku');
			var barcode = $(this).attr('barcode');
			var scanQ = parseInt($('#scanQuantity-' + barcode).text());
			var scanR = $('#scanResult-' + barcode).val();
			if(scanR == 'N')
			{
				scanResult += 'sku:' + sku + '未扫描;';
			}
			else if(scanR == 'F')
			{
				scanResult += 'sku:' + sku + '数量错误;';
			}
			else if(scanR == 'T')
			{
				skuTotal += scanQ;
			}
		});

		var scanForm = document.scanConfirmForm;
		scanForm.remarks.value = scanResult;

		if(skuTotal == scanForm.sku_total.value)
		{
			scanForm.scan_switch.value = 1;
		}
		else
		{
			scanForm.scan_switch.value = 2;
		}

		if(Zhiwo.Shipping.scanSkuTotal == scanForm.sku_total.value)
		{
			Zhiwo.Shipping.scanConfirm('check');
		}
	},

	scanConfirm : function(manual)
	{
		var scanObj = document.scanConfirmForm;
		var postData = 'order_id='+scanObj.order_id.value+'&delivery_number='+str_encode(scanObj.delivery_number.value) + '&scan_switch='+scanObj.scan_switch.value+'&remarks='+str_encode(scanObj.remarks.value);
		var preScanResult = '';
		Zhiwo.Ajaxhttp.postR(
			'/storage/shipping/scanconfirm',
			function(data) {
				if(data) {
					var jsObject = eval('('+data+')');
					preScanResult = '订单号 “' + scanObj.order_id.value + '” 物流单号 “' + scanObj.delivery_number.value + '” ';
					if(jsObject.status == 0) {
						preScanResult += jsObject.info;
						window.location.href = '/storage/shipping/examinegoods?pre_order_result='+str_encode(preScanResult);
					} else {
						if(manual == 'skip') {
							preScanResult += jsObject.info;
							window.location.href = '/storage/shipping/examinegoods?pre_order_result='+str_encode(preScanResult);
						} else {
							$('#scan_result').html('扫描失败');
						}
					}
				} else {
					$('#scan_result').html('正在提交扫描结果，请等待...');
				}
			},
			postData
		);
	},

	quickDelivery : function()
	{
		window.location.href="/storage/shipping/quickdelivery";
	},

	shippingConfirm : function()
	{
		var packager = document.selectForm.packager.value;
		if(packager == '')
		{
			alert('请选择打包员！');
			return false;
		}
		var deliveryNumber = document.selectForm.delivery_number.value;
		if(deliveryNumber == '')
		{
			alert('请扫描物流单号或者手工填写！');
			return false;
		}
		Zhiwo.Ajaxhttp.getR(
			'/storage/shipping/confirm?delivery_number='+deliveryNumber+'&packager='+packager,
			function(data)
			{
				var msgtips = document.getElementById('msgtips');
				var logtips = document.getElementById('logtips');
				var inputtips = document.getElementById('delivery_number');
				var ordercount = document.getElementById('ordercount');
				var logs = '详细信息：<br /><br />';
				if(data)
				{
					var jsObject = eval('('+data+')');
					if(jsObject.errorno == 0)
					{
						ordercount.innerText = parseInt(ordercount.innerText) + 1; //计数器
						msgtips.innerHTML = '<font color="green">包裹"'+inputtips.value+'"扫描发货完毕。</font>';
						inputtips.value = '';
						inputtips.focus();
					}
					else if(jsObject.errorno == 1)
					{
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"没有匹配到待发货订单！</font>';
						inputtips.value = '';
						inputtips.focus();
					}
					else if(jsObject.errorno == 2)
					{
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"没有扫描验货，请先扫描验货。</font>';
						inputtips.value = '';
						inputtips.focus();
					}
					else if(jsObject.errorno == 3)
					{
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"已经发货，请到“交易管理”中查询。</font>';
						inputtips.value = '';
						inputtips.focus();
					}
					else if(jsObject.errorno == 4)
					{
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"已经退货，请到“交易管理”中查询。</font>';
						inputtips.value = '';
						inputtips.focus();
					}
					else if(jsObject.errorno == 5)
					{
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"发货失败！</font>';
						inputtips.value = '';
						inputtips.focus();
					}
					else if(jsObject.errorno == 11)
					{
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"中的订单状态有问题！</font>';
						inputtips.value = '';
						inputtips.focus();
					}
					else
					{
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"不符合发货条件！</font>';
						inputtips.value = '';
						inputtips.focus();
					}


					if(jsObject.log.length > 0)
					{
						var j = 1;
						for(var i = 0; i < jsObject.log.length; i++)
						{
							logs += j + '、' + jsObject.log[i].msg + '<br /><br />';
							j++;
						}
						logtips.innerHTML = logs;
					}
				}
				else
				{
					msgtips.innerHTML = '<font color="red">正在扫描,请稍候...</font>';
				}
			}
		);
		return false;
	},

	updateDeliveryCompany : function(orderId, deliveryCompany, deliveryNumber)
	{
		var htmlTable;
		var companyArray = ['圆通速递','申通快递','中通速递','EMS邮政速递','宅急送_已付','宅急送','微特派','圆通货到付款','优速快递','安能物流'];
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
		htmlTable += '<tr><td width="120" height="30" align="right">原物流公司：</td><td align="left">'+deliveryCompany+'</td></tr>';
		htmlTable += '<tr><td width="120" height="30" align="right">原物流单号：</td><td align="left">'+deliveryNumber+'</td></tr>';
		htmlTable += '<tr><td width="120" height="30" align="right"><span style="color:red">*</span>新物流公司：<td	align="left"><select name="delivery_company">'+companyOptions+'</select></td></tr>';
		htmlTable += '<tr><td width="120" height="30" align="right"><span style="color:red">*</span>新物流单号：<td	align="left"><input name="delivery_number" type="text" size="16" maxlength="16" value="'+deliveryNumber+'" /></td></tr>';
		htmlTable += '<tr><td width="120" height="30">&nbsp;</td><td align="left"><input name="save" type="button" onClick="Zhiwo.Shipping.saveDeliveryCompany();" value="修 改" />&nbsp;&nbsp; &nbsp;&nbsp;';
		htmlTable += '<input name="close" type="button" onClick="Zhiwo.Shipping.close();" value="返 回" /></td></tr>';
		htmlTable += '</table></form>';
		Zhiwo.DialogBox.DialogShow('修改物流公司',htmlTable,700,450,450,320);
	},

	saveDeliveryCompany : function()
	{
		var objForm = document.updateDeliveryForm;
		var postData = "order_id=" + objForm.order_id.value + "&delivery_company=" + str_encode(objForm.delivery_company.value)+ "&delivery_number=" + str_encode(objForm.delivery_number.value);
		Zhiwo.Ajaxhttp.postR(
			'/storage/shipping/updatedelivery',
			function(data) {
				if(data) {
					if(data == 'succ') {
						alert('修改成功');
					} else {
						alert('修改失败');
					}
					Zhiwo.Shipping.close();
					window.location.reload();
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
	getFirstChar : function(str)
	{
		spstr = str.split("");
		return spstr[0];
	},
	getLastChar : function(str)
	{
		spstr = str.split("");
		return spstr[spstr.length-1];
	},
	close : function()
	{
		Zhiwo.DialogBox.DialogHide();
	}
}