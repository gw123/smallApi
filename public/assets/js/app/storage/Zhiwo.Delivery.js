/*!
 *
 * 新版发货管理
 * @package		Delivery
 * @author		zhaoshunyao
 * @date		2015/05/13
 */

if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};

Zhiwo.Delivery  = {
	//打印机设置
	printerList: [],
	getPrinterList : function() {
		var printerCount = LODOP.GET_PRINTER_COUNT();
		for(var i=0;i<printerCount;i++)
		{
			Zhiwo.Delivery.printerList[i] = LODOP.GET_PRINTER_NAME(i);
		}
	},
	
	setPrinter : function() {
		Zhiwo.Delivery.getPrinterList();
		var printerOption = '';
		for(var i=0;i<Zhiwo.Delivery.printerList.length;i++) {
			printerOption += '<option value="'+Zhiwo.Delivery.printerList[i]+'">'+Zhiwo.Delivery.printerList[i]+'</option>';
		}
		var htmlTable = '<form name="printerForm" action="return false;" method="post"><table class="noborder" width="98%">';
		htmlTable += '<tr><td height="50" valign="top">出库单打印机已绑定为 “'+outstoragePrinter+'”&nbsp;&nbsp; &gt&gt重选 <select name="outstorage_printer" size="1">'+printerOption+'</select></td></tr>';
		htmlTable += '<tr><td height="50" valign="top">发货单打印机已绑定为 “'+invoicePrinter+'”&nbsp;&nbsp; &gt&gt重选 <select name="invoice_printer" size="1">'+printerOption+'</select></td></tr>';
		htmlTable += '<tr><td height="50" valign="top">物流单打印机已绑定为 “'+deliveryPrinter+'”&nbsp;&nbsp; &gt&gt重选 <select name="delivery_printer" size="1">'+printerOption+'</select></td></tr>';
		htmlTable += '<tr><td height="50" valign="top">京东物流单机已绑定为 “'+jdDeliveryPrinter+'”&nbsp;&nbsp; &gt&gt重选 <select name="jdDelivery_printer" size="1">'+printerOption+'</select></td></tr>';
		htmlTable += '<tr><td height="20"><div id="printerMsg"></div></td></tr>';
		htmlTable += '<tr><td height="20"><input name="save" type="button" onClick="Zhiwo.Delivery.savePrinter();" value="保 存" />&nbsp;&nbsp; &nbsp;&nbsp;';
		htmlTable += '<input name="close" type="button" onClick="Zhiwo.Delivery.close();" value="返 回" /></td></tr>';
		htmlTable += '</table></form>';

		Zhiwo.DialogBox.DialogShow('绑定打印机',htmlTable,700,400,700,350);
	},

	savePrinter : function() {
		var objForm = document.printerForm;
		//保存到全局变量
		outstoragePrinter = objForm.outstorage_printer.value;
		invoicePrinter = objForm.invoice_printer.value;
		deliveryPrinter = objForm.delivery_printer.value;
		jdDeliveryPrinter = objForm.jdDelivery_printer.value;
		var postData = "outstorage_printer=" + objForm.outstorage_printer.value + "&invoice_printer=" + objForm.invoice_printer.value + "&delivery_printer=" + objForm.delivery_printer.value + "&jdDelivery_printer=" + objForm.jdDelivery_printer.value;
		Zhiwo.Ajaxhttp.postR(
			'/sys/settings/printerv2',
			function(data) {
				var msgtip = document.getElementById("printerMsg");
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
	
	getDate : function(format) {
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
	printSku : function() {
		var params = '';
		var orderNum = 0;
		var orderNo = 1;
		var orderIds = document.getElementsByName('orderIds[]');
		if(orderIds == null) return false;
		for(var i = 0; i < orderIds.length; i++) {
			if(orderIds[i].checked) {
				params += '&orderNo['+orderIds[i].value+']=' + orderNo;
				document.getElementById('print_status_1_'+orderIds[i].value).innerHTML = '1';
				orderNum++;
				orderNo++;
			}
		}
		if(orderNum <= 0) {
			alert("请选择要打印的订单！");
			return false;
		}
		
		Zhiwo.Ajaxhttp.getR(
			'/storage/delivery/printsku?'+params,
			function(data) {
				if(data) {
					var jsObject = eval('('+data+')');
					if(jsObject.error == 0 && jsObject.total > 0) {
						LODOP.PRINT_INITA(0,0,800,1200,"知我网_出库单");
						var ret = LODOP.SET_PRINTER_INDEXA(outstoragePrinter);
						if(!ret) return false;
						
						//批次条码
						LODOP.ADD_PRINT_BARCODE(3,15,265,50, "EAN13", jsObject.batch_number);
						LODOP.SET_PRINT_STYLEA(0,"FontSize",7);
						
						LODOP.ADD_PRINT_TEXT(10,320,170,25, jsObject.first_delivery_company + '_出库单');
						LODOP.SET_PRINT_STYLEA(0,"FontSize",14);
						
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
						for(var i=0;i<jsObject.rows.length;i++) {
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
						LODOP.ADD_PRINT_TEXT(3,500,270,20,printDate);
						LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
						LODOP.SET_PRINT_STYLEA(0,"ItemType",1);

						LODOP.ADD_PRINT_TEXT(3,710,135,20,"第#页/共&页");
						LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
						LODOP.SET_PRINT_STYLEA(0,"ItemType",2);
						LODOP.SET_PRINT_STYLEA(0,"Horient",1);
						ret = LODOP.PRINT();
						if(!ret) {
							alert("出库单打印失败！");
							return false;
						}
					} else if(jsObject.error == 1) {
						alert("获取出库打印批次号失败");
						return false;
					} else {
						alert("没有符合出库条件的商品");
						return false;
					}
				} else {
					//
				}
			}
		);
	},

	//打印发货单
	printInvoice : function() {
		var params = '';
		var orderNum = 0;
		var orderIds = document.getElementsByName('orderIds[]');
		if(orderIds == null) return false;
		for(var i = 0; i < orderIds.length; i++) {
			if(orderIds[i].checked) {
				params += "&orderIds[]=" + orderIds[i].value;
				document.getElementById('print_status_3_'+orderIds[i].value).innerHTML = '1';
				orderNum++;
			}
		}
		if(orderNum <= 0) {
			alert("请选择要打印的订单！");
			return false;
		}
		
		Zhiwo.Ajaxhttp.getR(
			'/storage/delivery/printinvoice?'+params, 
			function(data) {
				var complete = 0;
				var printDate = new Date().toLocaleDateString();
				if(data) {
					var jsObject = eval('('+data+')');
					if(jsObject.total > 0) {
						for(var i=0;i<jsObject.rows.length;i++) {
							if(complete > 50) break;

							LODOP.PRINT_INIT("");
							var ret = LODOP.SET_PRINTER_INDEXA(invoicePrinter);
							if(!ret) break;
							
							if(jsObject.rows[i].goods_total > 10) {
								LODOP.SET_PRINT_PAGESIZE(1,"210mm","280mm",""); //加纸
							} else {
								LODOP.SET_PRINT_PAGESIZE(1,"210mm","140mm","");
							}

							//单号条码
							//LODOP.ADD_PRINT_BARCODE(2,20,280,55,"EAN128A",jsObject.rows[i].order_id);
							LODOP.ADD_PRINT_BARCODE(2,20,280,55,"EAN13",jsObject.rows[i].order_id);
							LODOP.SET_PRINT_STYLEA(0,"FontSize",7);
						
							LODOP.ADD_PRINT_TEXT(60,220,200,22,"发货清单");
							LODOP.SET_PRINT_STYLEA(0,"FontSize",13);
							LODOP.SET_PRINT_STYLEA(0,"Bold",1);

							LODOP.ADD_PRINT_TEXT(85,20,150,20,"订单编号："+jsObject.rows[i].order_id);
							LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
							LODOP.ADD_PRINT_TEXT(85,180,160,20,"发货日期："+printDate);
							LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
							LODOP.ADD_PRINT_TEXT(85,350,160,20,"客户姓名："+jsObject.rows[i].receive_name);
							LODOP.SET_PRINT_STYLEA(0,"FontSize",9);

							if(jsObject.rows[i].wholesale == 1 || jsObject.rows[i].hide_price == 1) {
								//分销发货单[不显示价格]
								var strTableHtml = '<table border="1" width="520" cellpadding="1" cellspacing="0" align="center">';
								strTableHtml += '<thead style="height: 23px" bgcolor="#efefef">';
								strTableHtml += '<td width="340" align="center" style="font-size: 12px;">货品名称</td>';
								strTableHtml += '<td width="80" align="center" style="font-size: 12px;">库位</td>';
								strTableHtml += '<td width="80" align="center" style="font-size: 12px;">数量</td>';
								strTableHtml += '</thead>';

								var tr = '';
								var goodsList = jsObject.rows[i].goods_list;
								for(var j=0;j<goodsList.length;j++) {
									for(var k=0; k<goodsList[j].sku_list.length; k++) {
										tr += '<tr style="height: 20px;font-size: 11px;">';
										tr += '<td width="340" align="left">'+goodsList[j].sku_list[k].product_name+'</td>';
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
							} else {
								//常规发货单
								var strTableHtml = '<table border="1" width="520" cellpadding="1" cellspacing="0" align="center">';
								strTableHtml += '<thead style="height: 23px" bgcolor="#efefef">';
								strTableHtml += '<td width="280" align="center" style="font-size: 12px;">货品名称</td>';
								strTableHtml += '<td width="50" align="center" style="font-size: 12px;">库位</td>';
								strTableHtml += '<td width="50" align="center" style="font-size: 12px;">数量</td>';
								strTableHtml += '<td width="60" align="center" style="font-size: 12px;">单价</td>';
								strTableHtml += '<td width="80" align="center" style="font-size: 12px;">金额</td>';
								strTableHtml += '</thead>';

								var tr = '';
								var goodsList = jsObject.rows[i].goods_list;
								for(var j=0;j<goodsList.length;j++) {
									for(var k=0; k<goodsList[j].sku_list.length; k++) {
										tr += '<tr style="height: 20px;font-size: 11px;">';
										tr += '<td width="280" align="left">'+goodsList[j].sku_list[k].product_name+'</td>';
										tr += '<td width="50" align="center">'+goodsList[j].sku_list[k].pos_name+'</td>';
										tr += '<td width="50" align="center">'+goodsList[j].sku_list[k].product_num+'</td>';
										if (k == 0) {
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
							
							LODOP.ADD_PRINT_TABLE(110,10,540,"85%", strTableHtml);
							LODOP.PRINT();
							complete++;
						}

						if(complete >= jsObject.total) {
							alert("发货单已全部发送到打印机，请等待打印机完成工作。\n\n总计" + jsObject.total + "单。");
						} else {
							alert("发货单没有全部发送到打印机，请检查打印机！\n\n总计" + jsObject.total + "单，已发送" + complete + "单。");
							return false;
						}
					} else {
						alert("没有要发货的订单！");
						return false;
					}
				} else {
					//
				}
			}
		);
	},

	//报警提示声音
	playAlarm : function() {
		var div = document.getElementById('alarm_box');
		var url = '/static/images/alert.mp3';
		div.innerHTML = '<embed src="'+url+'" loop="0" autostart="true" hidden="true"></embed>';
	},

	//扫描验货
	examineGoods : function() {
		window.location.href="/storage/delivery/examinegoods";
	},
	//大宗商品扫描验货
	examineLargeGoods : function() {
		window.location.href="/storage/delivery/examinelargegoods";
	},

	scanExamineOrderId : function() {
		var orderId = document.scanForm1.order_id.value;
		if(orderId == "") {
			alert("请扫描订单号！");
			return false;
		}
		
		Zhiwo.Ajaxhttp.getR(
			'/storage/delivery/scanorderid?order_id='+orderId, 
			function(data) {
				if(data) {
					var jsObject = eval('('+data+')');
					if(jsObject.errno == 0) {
						var orderInfoHtml = '<h5>客户信息</h5>';
						orderInfoHtml += '<table width="800" class="noborder">';
						orderInfoHtml += '<tr>';
						orderInfoHtml += '<td width="33%">订单编号：'+jsObject.order_info.order_id+'</td>';
						orderInfoHtml += '<td width="33%">会员名称：'+jsObject.order_info.member_name+'</td>';
						orderInfoHtml += '<td width="33%">配送方式：'+jsObject.order_info.delivery_channel+'</td>';
						orderInfoHtml += '</tr>';
						orderInfoHtml += '<tr>';
						orderInfoHtml += '<td width="33%">收货人：'+jsObject.order_info.receive_name+'</td>';
						orderInfoHtml += '<td width="67%" colspan="2">收货地址：'+jsObject.order_info.receive_addr+'</td>';
						orderInfoHtml += '</tr>';
						orderInfoHtml += '<tr>';
						orderInfoHtml += '<td width="33%">下单时间：'+jsObject.order_info.create_time+'</td>';
						orderInfoHtml += '<td width="33%">配货时间：'+jsObject.order_info.picking_time+'</td>';
						orderInfoHtml += '<td width="33%">商品总金额：'+jsObject.order_info.total_amount+' 元</td>';
						orderInfoHtml += '</tr>';
						orderInfoHtml += '</table>';
						
						orderInfoHtml += '<h5>商品信息</h5>';
						orderInfoHtml += '<form name="scanExamineConfirmForm" id="scanExamineConfirmForm" method="post" onsubmit="return false;">';
						orderInfoHtml += '<input type="hidden" name="sku_total" value="'+jsObject.order_info.sku_total+'" />';
						orderInfoHtml += '<table id="sku_list">';
						orderInfoHtml += '<tr bgcolor="#7A97E0" height="18">';
						orderInfoHtml += '<td width="300">货品名称</td><td width="120">sku号</td><td width="100">条码</td><td width="60">数量</td><td width="60">扫描数量</td><td width="60">扫描结果</td></tr>';
						
						for(var k=0;k<jsObject.sku_list.length;k++) {
							orderInfoHtml += '<tr>';
							orderInfoHtml += '<td width="300">'+jsObject.sku_list[k].name+'</td>';
							orderInfoHtml += '<td width="120">'+jsObject.sku_list[k].sku+'</td>';
							orderInfoHtml += '<td width="100"><div class="skuItem" sku="'+jsObject.sku_list[k].sku+'" barcode="'+jsObject.sku_list[k].barcode+'" quantity="'+jsObject.sku_list[k].quantity+'">'+jsObject.sku_list[k].barcode+'</div></td>';
							orderInfoHtml += '<td width="60"><div id="realQuantity-'+jsObject.sku_list[k].barcode+'">'+jsObject.sku_list[k].quantity+'</div></td>';
							orderInfoHtml += '<td width="60"><div id="scanQuantity-'+jsObject.sku_list[k].barcode+'">0</div></td>';
							orderInfoHtml += '<td width="80"><div id="scanFlag-'+jsObject.sku_list[k].barcode+'">&nbsp;</div><input type="hidden" name="scanResult[]" id="scanResult-'+jsObject.sku_list[k].barcode+'" value="N" /></td>';
							orderInfoHtml += '</tr>';
						}
						orderInfoHtml += '</table>';
						orderInfoHtml += '<table class="noborder">';
						orderInfoHtml += '<tr>';
						orderInfoHtml += '<td width="300" colspan="2">';
						orderInfoHtml += '<input type="hidden" name="order_id" value="'+jsObject.order_info.order_id+'" />';
						orderInfoHtml += '<input type="hidden" name="remarks" value="" />';
						orderInfoHtml += '<input type="button" name="pass" value="重新扫描" onclick="Zhiwo.Delivery.scanExamineConfirm(0);" />';
						orderInfoHtml += '</td>';
						orderInfoHtml += '</tr>';
						orderInfoHtml += '</table>';
						orderInfoHtml += '</form>';
						
						$('#order_info').html(orderInfoHtml);
						document.scanForm2.barcode.focus();
					} else {
						document.scanForm1.order_id.value = '';
						document.scanForm1.order_id.focus();
						$('#order_info').html('<p style="color:red;font-size:15px;font-weight:bold">扫描失败：'+jsObject.msg+'</p>');
					}
				} else {
					$('#order_info').html("扫描中，请等待...");
				}
			}
		);
		return false;
	},
	scanExamineLargeOrderId : function() {
		var orderId = document.scanForm1.order_id.value;
		if(orderId == "") {
			alert("请扫描订单号！");
			return false;
		}
		
		Zhiwo.Ajaxhttp.getR(
			'/storage/delivery/scanorderid?order_id='+orderId, 
			function(data) {
				if(data) {
					var jsObject = eval('('+data+')');
					if(jsObject.errno == 0) {
						if(jsObject.order_info.pay_way != "Stages"){
							alert("此订单非账期订单,请使用正常验货界面");
							return false;
						}
						
						var orderInfoHtml = '<h5>客户信息</h5>';
						orderInfoHtml += '<table width="800" class="noborder">';
						orderInfoHtml += '<tr>';
						orderInfoHtml += '<td width="33%">订单编号：'+jsObject.order_info.order_id+'</td>';
						orderInfoHtml += '<td width="33%">会员名称：'+jsObject.order_info.member_name+'</td>';
						orderInfoHtml += '<td width="33%">配送方式：'+jsObject.order_info.delivery_channel+'</td>';
						orderInfoHtml += '</tr>';
						orderInfoHtml += '<tr>';
						orderInfoHtml += '<td width="33%">收货人：'+jsObject.order_info.receive_name+'</td>';
						orderInfoHtml += '<td width="67%" colspan="2">收货地址：'+jsObject.order_info.receive_addr+'</td>';
						orderInfoHtml += '</tr>';
						orderInfoHtml += '<tr>';
						orderInfoHtml += '<td width="33%">下单时间：'+jsObject.order_info.create_time+'</td>';
						orderInfoHtml += '<td width="33%">配货时间：'+jsObject.order_info.picking_time+'</td>';
						orderInfoHtml += '<td width="33%">商品总金额：'+jsObject.order_info.total_amount+' 元</td>';
						orderInfoHtml += '</tr>';
						orderInfoHtml += '</table>';
						
						orderInfoHtml += '<h5>商品信息</h5>';
						orderInfoHtml += '<form name="scanExamineConfirmForm" id="scanExamineConfirmForm" method="post" onsubmit="return false;">';
						orderInfoHtml += '<input type="hidden" name="sku_total" value="'+jsObject.order_info.sku_total+'" />';
						orderInfoHtml += '<table id="sku_list">';
						orderInfoHtml += '<tr bgcolor="#7A97E0" height="18">';
						orderInfoHtml += '<td width="300">货品名称</td><td width="120">sku号</td><td width="100">条码</td><td width="60">数量</td><td width="60">扫描数量</td><td width="60">扫描结果</td></tr>';
						
						for(var k=0;k<jsObject.sku_list.length;k++) {
							orderInfoHtml += '<tr>';
							orderInfoHtml += '<td width="300">'+jsObject.sku_list[k].name+'</td>';
							orderInfoHtml += '<td width="120">'+jsObject.sku_list[k].sku+'</td>';
							orderInfoHtml += '<td width="100"><div class="skuItem" sku="'+jsObject.sku_list[k].sku+'" barcode="'+jsObject.sku_list[k].barcode+'" quantity="'+jsObject.sku_list[k].quantity+'">'+jsObject.sku_list[k].barcode+'</div></td>';
							orderInfoHtml += '<td width="60"><div id="realQuantity-'+jsObject.sku_list[k].barcode+'">'+jsObject.sku_list[k].quantity+'</div></td>';
							orderInfoHtml += '<td width="60"><div id="scanQuantity-'+jsObject.sku_list[k].barcode+'"><input id="scanQuantityLargeBarcode-'+jsObject.sku_list[k].barcode+'" value="0" /></div></td>';
							orderInfoHtml += '<td width="80"><div id="scanFlag-'+jsObject.sku_list[k].barcode+'">&nbsp;</div><input type="hidden" name="scanResult[]" id="scanResult-'+jsObject.sku_list[k].barcode+'" value="N" /></td>';
							orderInfoHtml += '</tr>';
						}
						orderInfoHtml += '</table>';
						orderInfoHtml += '<table class="noborder">';
						orderInfoHtml += '<tr>';
						orderInfoHtml += '<td width="300" colspan="2">';
						orderInfoHtml += '<input type="hidden" name="order_id" value="'+jsObject.order_info.order_id+'" />';
						orderInfoHtml += '<input type="hidden" name="remarks" value="" />';
						orderInfoHtml += '<input type="button" name="pass" value="重新扫描" onclick="Zhiwo.Delivery.scanExamineConfirm(0);" />';
						orderInfoHtml += '</td>';
						orderInfoHtml += '</tr>';
						orderInfoHtml += '</table>';
						orderInfoHtml += '</form>';
						
						$('#order_info').html(orderInfoHtml);
						document.scanForm2.barcode.focus();
					} else {
						document.scanForm1.order_id.value = '';
						document.scanForm1.order_id.focus();
						$('#order_info').html('<p style="color:red;font-size:15px;font-weight:bold">扫描失败：'+jsObject.msg+'</p>');
					}
				} else {
					$('#order_info').html("扫描中，请等待...");
				}
			}
		);
		return false;
	},

	scanSkuTotal : 0,
	scanExamineBarcode : function() {
		var barcode = document.scanForm2.barcode.value;
		if(barcode == "") {
			$('#barcode_tips').html('请扫描货品条码！');
			return false;
		}
		Zhiwo.Delivery.scanSkuTotal++;

		var realObj = $('#sku_list').find('#realQuantity-' + barcode);
		if(realObj && realObj.text()) {
			var realQ = parseInt(realObj.text());
			var scanObj = $('#sku_list').find('#scanQuantity-' + barcode);
			var scanQ = parseInt(scanObj.text()) + 1;
			scanObj.text(scanQ);

			if(realQ == scanQ) {
				$('#scanFlag-' + barcode).html('<span style="color:green;font-weight:bold">√</span>');
				$('#scanResult-' + barcode).val('T'); //扫描数量正确
			} else {
				$('#scanFlag-' + barcode).html('<span style="color:red;font-weight:bold">ㄨ</span>');
				$('#scanResult-' + barcode).val('F');	//扫描数量错误
			}
			$('#barcode_tips').html('<span style="color:green">扫描成功，“'+barcode+'”</span>');
			Zhiwo.Delivery.scanExamineProcess();
		} else {
			$('#barcode_tips').html('<span style="color:red">扫描失败，“'+barcode+'”未匹配</span>');
			document.getElementById('order_id').disabled = true;
			document.getElementById('barcode').disabled = true;
			Zhiwo.Delivery.playAlarm();
		}

		document.scanForm2.barcode.value = '';
		return false;
	},
	scanExamineLargeBarcode : function() {
		var barcode = document.scanForm2.barcode.value;
		if(barcode == "") {
			$('#barcode_tips').html('请扫描货品条码！');
			return false;
		}
		

		var realObj = $('#sku_list').find('#realQuantity-' + barcode);
		if(realObj && realObj.text()) {
			var realQ = parseInt(realObj.text());
			var scanObj = $('#sku_list').find('#scanQuantityLargeBarcode-' + barcode);			
			var scanQ = parseInt(scanObj.val());
			Zhiwo.Delivery.scanSkuTotal += scanQ;
			scanObj.text(scanQ);

			if(realQ == scanQ) {
				$('#scanFlag-' + barcode).html('<span style="color:green;font-weight:bold">√</span>');
				$('#scanResult-' + barcode).val('T'); //扫描数量正确
			} else {
				$('#scanFlag-' + barcode).html('<span style="color:red;font-weight:bold">ㄨ</span>');
				$('#scanResult-' + barcode).val('F');	//扫描数量错误
			}
			$('#barcode_tips').html('<span style="color:green">扫描成功，“'+barcode+'”</span>');
			Zhiwo.Delivery.scanExamineProcess();
		} else {
			$('#barcode_tips').html('<span style="color:red">扫描失败，“'+barcode+'”未匹配</span>');
			document.getElementById('order_id').disabled = true;
			document.getElementById('barcode').disabled = true;
			Zhiwo.Delivery.playAlarm();
		}

		document.scanForm2.barcode.value = '';
		return false;
	},

	scanExamineProcess : function() {
		var skuObj = $('#sku_list');
		var skuTotal = 0;
		var scanResult = '';
		skuObj.find('.skuItem').each(function() {
			var barcode = $(this).attr('barcode');
			var scanQ = parseInt($('#scanQuantity-' + barcode).text());
			var scanR = $('#scanResult-' + barcode).val();
			if(scanR == 'N') {
				scanResult += barcode + '未扫描;';
			} else if(scanR == 'F') {
				scanResult += barcode + '数量错误;';
			} else if(scanR == 'T') {
				skuTotal += scanQ;
			}
		});

		var scanForm = document.scanExamineConfirmForm;
		scanForm.remarks.value = scanResult;

		if (Zhiwo.Delivery.scanSkuTotal >= scanForm.sku_total.value) {
			if (skuTotal != scanForm.sku_total.value) {
				$('#scan_result').html(scanResult);
				Zhiwo.Delivery.playAlarm();
				return false;
			} else {
				Zhiwo.Delivery.scanExamineConfirm(1);
			}
		}
	},
	
	scanExamineConfirm : function(manual) {
		if (manual == 0) {
			window.location.href = '/storage/delivery/examinegoods';
			return false;
		}
		
		var scanObj = document.scanExamineConfirmForm;
		var orderId = scanObj.order_id.value;
		var postData = 'order_id=' + orderId + '&remarks=' + str_encode(scanObj.remarks.value);
		var preScanResult = '';
		Zhiwo.Ajaxhttp.postR(
			'/storage/delivery/scanconfirm',
			function(data) {
				if(data) {
					var jsObject = eval('('+data+')');
					preScanResult = '订单 “' + orderId + '” ' + jsObject.msg;
					if(jsObject.errno == 0) {
						Zhiwo.Delivery.scanSkuTotal = 0;
						$('#order_info').html(preScanResult);
						document.scanForm2.barcode.value = '';
						document.scanForm1.order_id.value = '';
						document.scanForm1.order_id.focus();
						$('#scan_result').html('');
						//打印运单
                        Zhiwo.Delivery.printSingleWaybill(orderId);
					} else {
						$('#scan_result').html(preScanResult);
						Zhiwo.Delivery.playAlarm();
					}
				} else {
					$('#scan_result').html('正在提交扫描，请等待...');
				}
			},
			postData
		);
	},

	curDeliveryCompany : '',
	//打印运单
	printSingleWaybill : function(orderId) {
		LODOP.PRINT_INIT("");
		var ret = LODOP.SET_PRINTER_INDEXA(deliveryPrinter);
		if(!ret) {
			alert('找不到物流打印机:'+deliveryPrinter);
			return false;
		}
		$.get('/storage/delivery/printsinglewaybill?' + Math.random(),{order_id:orderId},function(data) {
			if(data.errno == 0){
				Zhiwo.Delivery.printWaybill(data.order);
				return true;
			}else{
				alert(data.msg);
				return false;
			}
		},'json');    
	},

	//重新打印运单
	rePrintSingleWaybill : function(orderId) {
		LODOP.PRINT_INIT("");
		var ret = LODOP.SET_PRINTER_INDEXA(deliveryPrinter);
		if(!ret) {
			alert('找不到物流打印机:'+deliveryPrinter);
			return false;
		}
		$.get('/storage/delivery/reprintsinglewaybill?' + Math.random(),{order_id:orderId},function(data) {			
			if(data.errno == 0) {
				Zhiwo.Delivery.printWaybill(data.order);
				return true;
			}else{
				alert(data.msg);
				return false;
			}
		},'json');    
	},

	//批量打印物流单
	batchPrintWaybill : function(batchNumber) {
		LODOP.PRINT_INIT("");
		var ret = LODOP.SET_PRINTER_INDEXA(deliveryPrinter);
		if(!ret) {
			alert('找不到物流打印机:'+deliveryPrinter);
			return false;
		}
		
		$.get('/storage/delivery/batchprint',{batch_number:batchNumber},function(data){
		   if(data.code == 0) {
				for(var i=0; i<data.orders.length; i++){
					Zhiwo.Delivery.printWaybill(data.orders[i]);
				}
			} else {
			   alert(data.msg);
			}
		});
	},

	//组装模板打印运单
	printWaybill : function(order) {
		switch (order.delivery_company) {
		   case '圆通速递':			Zhiwo.Delivery.printYto(order);LODOP.PRINT();break;
		   case '圆通货到付款':		Zhiwo.Delivery.printYtoCOD(order);LODOP.PRINT();break;
		   case '申通快递':			Zhiwo.Delivery.printSto(order);LODOP.PRINT();break;
		   case '中通速递': 		Zhiwo.Delivery.printZto(order);LODOP.PRINT();break;
		   case '百世快递': 		Zhiwo.Delivery.printBest(order);LODOP.PRINT();break;
		   case '宅急送':			Zhiwo.Delivery.printZjsCOD(order);LODOP.PRINT();break;
		   case	'京东货到付款':		Zhiwo.Delivery.printJdCOD(order);LODOP.PRINT();break;
		   case	'京东快递':		Zhiwo.Delivery.printJdExpressO(order);LODOP.PRINT();break;
		   case '宅急送_好药师':	Zhiwo.Delivery.ZJSCODHYSDelivery(order);LODOP.PRINT();break;
		   case '宅急送_已付': 		Zhiwo.Delivery.ZJSDelivery(order);LODOP.PRINT();break;
		   case	'微特派': 			Zhiwo.Delivery.VTEPAIDelivery(order);LODOP.PRINT();break;
		   case 'EMS邮政速递':		Zhiwo.Delivery.EMSDelivery(order);LODOP.PRINT();break;
		   case 'EMS国内经济快递':	Zhiwo.Delivery.EMSEconomyDelivery(order);LODOP.PRINT();break;
		   default : alert('没有对应的运单模板:orderId:'+ order.order_id +' '+ order.delivery_company);
		}
	},

	getSenderName : function(channel) {
		//寄件人姓名
		if(channel == 'pinzhi365') {
			return '品质365';
		} else if(channel == 'davdian') {
			return '大V店';
		} else if(channel == 'gegejia'){
			return '格格家';
		} else {
			return '知我药妆';
		}
	},
	getSenderPhone : function(channel) {
		//寄件人电话
		if(channel == 'pinzhi365') {
			return '400-9987-365';
		} else if(channel == 'gegejia'){
			return '400-1603-602';
		} else {
			return '400-6301-018'; //知网电话
		}
	},
	getSenderAddr : function(channel) {
		return '北京市顺义区铁匠营村斯派特物流园9号库';
	},

	quickDelivery : function() {
		window.location.href="/storage/delivery/quickdelivery";
	},

	deliveryConfirm : function() {
		if(Zhiwo.Delivery.curDeliveryCompany == '') {
			alert('请选择物流公司');
			return false;
		}
		
		var deliveryNumber = document.selectForm.delivery_number.value;
		if(deliveryNumber == '') {
			alert('请扫描物流单号或者手工填写！');
			return false;
		}
		Zhiwo.Ajaxhttp.getR(
			'/storage/delivery/confirm?delivery_number='+deliveryNumber+'&delivery_company='+encodeURI(Zhiwo.Delivery.curDeliveryCompany), 
			function(data) {
				var msgtips = document.getElementById('msgtips');
				var logtips = document.getElementById('logtips');
				var inputtips = document.getElementById('delivery_number');
				var ordercount = document.getElementById('ordercount');
				var logs = '详细信息：<br /><br />';
				if(data) {
					var jsObject = eval('('+data+')');
					if(jsObject.errno == 0) {
						ordercount.innerText = parseInt(ordercount.innerText) + 1; //计数器
						msgtips.innerHTML = '<font color="green">包裹"'+inputtips.value+'"扫描发货完毕。</font>';
						inputtips.value = '';
						inputtips.focus();
					} else if(jsObject.errno == 1) {
						Zhiwo.Delivery.playAlarm();
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"没有匹配到待发货订单！</font>';
						inputtips.value = '';
						inputtips.focusout();
					} else if(jsObject.errno == 2) {
						Zhiwo.Delivery.playAlarm();
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"没有扫描验货，请先扫描验货。</font>';
						inputtips.value = '';
						inputtips.focusout();
					} else if(jsObject.errno == 3) {
						Zhiwo.Delivery.playAlarm();
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"已经发货，请到“交易管理”中查询。</font>';
						inputtips.value = '';
						inputtips.focusout();
					} else if(jsObject.errno == 4) {
						Zhiwo.Delivery.playAlarm();
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"已经退货，请到“交易管理”中查询。</font>';
						inputtips.value = '';
						inputtips.focusout();
					} else if(jsObject.errno == 5) {
						Zhiwo.Delivery.playAlarm();
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"没有财审或客审！</font>';
						inputtips.value = '';
						inputtips.focusout();
					} else if(jsObject.errno == 6) {
						Zhiwo.Delivery.playAlarm();
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"物流错误！</font>';
						inputtips.value = '';
						inputtips.focusout();
					} else if(jsObject.errno == 7) {
						Zhiwo.Delivery.playAlarm();
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"系统错误！</font>';
						inputtips.value = '';
						inputtips.focusout();
					} else if(jsObject.errno == 9){
						Zhiwo.Delivery.playAlarm();
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"订单状态为取消或完成！</font>';
						inputtips.value = '';
						inputtips.focusout();
					} else if(jsObject.errno == 11) {
						Zhiwo.Delivery.playAlarm();
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"中的订单状态有问题！</font>';
						inputtips.value = '';
						inputtips.focusout();
					} else if(jsObject.errno == 10){
						Zhiwo.Delivery.playAlarm();
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"中的订单已退货！</font>';
						inputtips.value = '';
						inputtips.focusout();
					} else {
						Zhiwo.Delivery.playAlarm();
						msgtips.innerHTML = '<font color="red">包裹"'+inputtips.value+'"不符合发货条件！</font>';
						inputtips.value = '';
						inputtips.focusout();
					}

					if(jsObject.log.length > 0) {
						var j = 1;
						for(var i = 0; i < jsObject.log.length; i++) {
							logs += j + '、' + jsObject.log[i].msg + '<br /><br />';
							j++;
						}
						logtips.innerHTML = logs;
					}
				} else {
					msgtips.innerHTML = '<font color="red">正在扫描,请稍候...</font>';
				}
			}
		);
		return false;
	},
	
	updateDeliveryCompany : function(orderId, deliveryCompany, deliveryNumber) {
		var htmlTable;
		var companyArray = ['圆通速递','申通快递','中通速递','百世快递','EMS邮政速递','宅急送_已付','宅急送','微特派','圆通货到付款','京东快递'];
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
		htmlTable += '<tr><td width="120" height="30">&nbsp;</td><td align="left"><input name="save" type="button" onClick="Zhiwo.Delivery.saveDeliveryCompany();" value="修 改" />&nbsp;&nbsp; &nbsp;&nbsp;';
		htmlTable += '<input name="close" type="button" onClick="Zhiwo.Delivery.close();" value="返 回" /></td></tr>';
		htmlTable += '</table></form>';
		Zhiwo.DialogBox.DialogShow('修改物流公司',htmlTable,700,450,450,320);
	},

	saveDeliveryCompany : function() {
		var objForm = document.updateDeliveryForm;
		var postData = "order_id=" + objForm.order_id.value + "&delivery_company=" + str_encode(objForm.delivery_company.value)+ "&delivery_number=" + str_encode(objForm.delivery_number.value);
		Zhiwo.Ajaxhttp.postR(
			'/storage/delivery/updatedelivery',
			function(data) {
				if(data) {
					if(data == 'succ') {
						alert('修改成功');
					} else {
						alert('修改失败');
					}
					Zhiwo.Delivery.close();
					window.location.reload();
				}
			},
			postData
		);
	},
	
	selectAll : function(pnode, checkItem) {
		var pnode = document.getElementById(pnode);
		var des = document.getElementsByName(checkItem);
		for(var i=0;i<des.length;i++)
		{
			if(des[i].disabled==true) continue;
			if(des[i].checked = pnode.checked){}
		}
	},
	getFirstChar : function(str) {
		spstr = str.split("");
		return spstr[0];
	},
	getLastChar : function(str) {
		spstr = str.split("");
		return spstr[spstr.length-1];
	},
	close : function() {
		Zhiwo.DialogBox.DialogHide();
	}
}

//打印圆通运单
Zhiwo.Delivery.printYto = function(order) {
	var senderName = Zhiwo.Delivery.getSenderName(order.channel);
	var senderPhone = Zhiwo.Delivery.getSenderPhone(order.channel);
	var senderAddr = Zhiwo.Delivery.getSenderAddr();

	LODOP.SET_PRINT_PAGESIZE(1, '103mm', '152.5mm', "");

	//上联外边框
	LODOP.ADD_PRINT_LINE('1mm','3mm','1mm','98mm',0,2);
	LODOP.ADD_PRINT_LINE('1mm','3mm','95mm','3mm',0,2);
	LODOP.ADD_PRINT_LINE('1mm','98mm','95mm','98mm',0,2);
	LODOP.ADD_PRINT_LINE('95mm','3mm','95mm','98mm',0,2);
	
	LODOP.ADD_PRINT_BARCODE('5mm','55mm','40mm','8mm',"128A", order.packageCenterCode);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);

	LODOP.ADD_PRINT_TEXT('15mm','8mm','90mm','10mm',order.shortAddress ? order.shortAddress : order.receive_city);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",22);
	LODOP.SET_PRINT_STYLEA(0,"Bold",1);
	
	LODOP.ADD_PRINT_LINE('25mm','3mm','25mm','98mm',0,1);
	LODOP.ADD_PRINT_BARCODE('27mm','10mm','50mm','10mm',"EAN128A", order.delivery_number)//运单条码
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

	LODOP.ADD_PRINT_LINE('38mm','3mm','38mm','98mm',0,1);
	LODOP.ADD_PRINT_TEXT('40mm','4mm','5mm','12mm','收\n件\n人');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_LINE('38mm','8mm','54mm','8mm',0,1);
	LODOP.ADD_PRINT_TEXT('39mm','9mm','80mm','10mm',order.receive_addr);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
	LODOP.ADD_PRINT_TEXT('49mm','9mm','18mm','5mm',order.receive_name);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('49mm','30mm','50mm','5mm','电话:'+order.receive_mobile);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
	LODOP.ADD_PRINT_LINE('54mm','3mm','54mm','98mm',0,1);
	
	LODOP.ADD_PRINT_TEXT('55mm','4mm','5mm','12mm','寄\n件\n人');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_LINE('54mm','8mm','68mm','8mm',0,1);
	LODOP.ADD_PRINT_TEXT('57mm', '9mm', '85mm', '11mm', senderName + '    ' + senderPhone + "\n" + senderAddr);
	
	LODOP.ADD_PRINT_LINE('68mm','3mm','68mm','98mm',0,1);
	LODOP.ADD_PRINT_TEXT('70mm','9mm','50mm','5mm','订单号: '+order.order_id);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('75mm','9mm','50mm','5mm','内件品名： 化妆品');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_LINE('68mm','60mm','95mm','60mm',0,1);
	LODOP.ADD_PRINT_TEXT('70mm','62mm','25mm','10mm','收件人签名:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	
	//下联外边框
	LODOP.ADD_PRINT_LINE('105mm','3mm','105mm','98mm',0,2);
	LODOP.ADD_PRINT_LINE('105mm','3mm','148mm','3mm',0,2);
	LODOP.ADD_PRINT_LINE('105mm','98mm','148mm','98mm',0,2);
	LODOP.ADD_PRINT_LINE('148mm','3mm','148mm','98mm',0,2);
	
	LODOP.ADD_PRINT_TEXT('107mm', '4mm', '35mm', '10mm', "圆通速递");
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '22');
	LODOP.ADD_PRINT_BARCODE('107mm','40mm','50mm','10mm',"EAN128A", order.delivery_number);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

	LODOP.ADD_PRINT_LINE('118mm','3mm','118mm','98mm',0,1);
	LODOP.ADD_PRINT_TEXT('120mm','4mm','5mm','11mm','收\n件\n人');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_LINE('118mm','8mm','135mm','8mm',0,1);
	LODOP.ADD_PRINT_TEXT('120mm','9mm','80mm','10mm',order.receive_addr);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
	LODOP.ADD_PRINT_TEXT('130mm','9mm','18mm','5mm',order.receive_name);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('130mm','30mm','50mm','5mm','电话:'+order.receive_mobile);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

	LODOP.ADD_PRINT_LINE('135mm','3mm','135mm','98mm',0,1);
	LODOP.ADD_PRINT_TEXT('140mm','4mm','5mm','38mm','');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_LINE('135mm','8mm','148mm','8mm',0,1);
	LODOP.ADD_PRINT_TEXT('136mm','9mm','50mm','5mm','订单号: '+order.order_id);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('141mm','9mm','50mm','5mm','内件品名：化妆品');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
}

//打印圆通货到付款运单
Zhiwo.Delivery.printYtoCOD = function(order) {
	var senderName = Zhiwo.Delivery.getSenderName(order.channel);
	var senderPhone = Zhiwo.Delivery.getSenderPhone(order.channel);
	var senderAddr = Zhiwo.Delivery.getSenderAddr();

	LODOP.SET_PRINT_PAGESIZE(1, '103mm', '152.5mm', "");

	//上联外边框
	LODOP.ADD_PRINT_LINE('1mm','3mm','1mm','98mm',0,2);
	LODOP.ADD_PRINT_LINE('1mm','3mm','95mm','3mm',0,2);
	LODOP.ADD_PRINT_LINE('1mm','98mm','95mm','98mm',0,2);
	LODOP.ADD_PRINT_LINE('95mm','3mm','95mm','98mm',0,2);
	
	LODOP.ADD_PRINT_TEXT('5mm','3mm','50mm','8mm',order.shortAddress ? order.shortAddress : order.receive_city);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",22);
	LODOP.SET_PRINT_STYLEA(0,"Bold",1);
	
	LODOP.ADD_PRINT_BARCODE('5mm','55mm','40mm','8mm',"128A", order.packageCenterCode);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	
	
	LODOP.ADD_PRINT_TEXT('12mm','4mm','90mm','5mm','代收货款 ￥' +order.total_amount);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",22);
	
	LODOP.ADD_PRINT_LINE('25mm','3mm','25mm','98mm',0,1);
	LODOP.ADD_PRINT_BARCODE('27mm','10mm','50mm','10mm',"EAN128A", order.delivery_number)//运单条码
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

	LODOP.ADD_PRINT_LINE('38mm','3mm','38mm','98mm',0,1);
	LODOP.ADD_PRINT_TEXT('40mm','4mm','5mm','12mm','收\n件\n人');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_LINE('38mm','8mm','54mm','8mm',0,1);
	LODOP.ADD_PRINT_TEXT('39mm','9mm','80mm','10mm',order.receive_addr);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
	LODOP.ADD_PRINT_TEXT('49mm','9mm','18mm','5mm',order.receive_name);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('49mm','30mm','50mm','5mm','电话:'+order.receive_mobile);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
	LODOP.ADD_PRINT_LINE('54mm','3mm','54mm','98mm',0,1);
	
	LODOP.ADD_PRINT_TEXT('55mm','4mm','5mm','12mm','寄\n件\n人');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_LINE('54mm','8mm','68mm','8mm',0,1);
	LODOP.ADD_PRINT_TEXT('57mm', '9mm', '85mm', '11mm', senderName + '    ' + senderPhone + "\n" + senderAddr);
	
	LODOP.ADD_PRINT_LINE('68mm','3mm','68mm','98mm',0,1);
	LODOP.ADD_PRINT_TEXT('70mm','9mm','50mm','5mm','订单号: '+order.order_id);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('75mm','9mm','50mm','5mm','内件品名： 化妆品');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_LINE('68mm','60mm','95mm','60mm',0,1);
	LODOP.ADD_PRINT_TEXT('70mm','62mm','25mm','10mm','收件人签名:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	
	//下联外边框
	LODOP.ADD_PRINT_LINE('100mm','3mm','100mm','98mm',0,2);
	LODOP.ADD_PRINT_LINE('100mm','3mm','148mm','3mm',0,2);
	LODOP.ADD_PRINT_LINE('100mm','98mm','148mm','98mm',0,2);
	LODOP.ADD_PRINT_LINE('148mm','3mm','148mm','98mm',0,2);
	
	LODOP.ADD_PRINT_TEXT('101mm', '4mm', '35mm', '10mm', "圆通速递");
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '22');
	LODOP.ADD_PRINT_BARCODE('101mm','40mm','50mm','10mm',"EAN128A", order.delivery_number);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

	LODOP.ADD_PRINT_LINE('111mm','3mm','111mm','98mm',0,1);
	LODOP.ADD_PRINT_TEXT('113mm','4mm','5mm','11mm','收\n件\n人');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_LINE('111mm','8mm','128mm','8mm',0,1);
	LODOP.ADD_PRINT_TEXT('113mm','9mm','80mm','10mm',order.receive_addr);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
	LODOP.ADD_PRINT_TEXT('123mm','9mm','18mm','5mm',order.receive_name);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('123mm','30mm','50mm','5mm','电话:'+order.receive_mobile);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

	LODOP.ADD_PRINT_LINE('128mm','3mm','128mm','98mm',0,1);
	LODOP.ADD_PRINT_TEXT('133mm','4mm','5mm','38mm','');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_LINE('128mm','8mm','138mm','8mm',0,1);
	LODOP.ADD_PRINT_TEXT('129mm','9mm','50mm','4mm','订单号: '+order.order_id);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('133mm','9mm','50mm','4mm','内件品名：化妆品');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_LINE('138mm','3mm','138mm','98mm',0,1);
	LODOP.ADD_PRINT_TEXT('139mm','4mm','97mm','8mm','代收货款 ￥'+order.total_amount);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",22);
}
//打印申通运单
Zhiwo.Delivery.printSto = function(order) {
	var senderName = Zhiwo.Delivery.getSenderName(order.channel);
	var senderPhone = Zhiwo.Delivery.getSenderPhone(order.channel);
	var senderAddr = Zhiwo.Delivery.getSenderAddr();

	LODOP.SET_PRINT_PAGESIZE(1, '103mm', '152.5mm', "");

	LODOP.ADD_PRINT_TEXT('3mm','4mm','35mm','10mm','申通快递');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",20);
	
	LODOP.ADD_PRINT_BARCODE('3mm','45mm','50mm','12mm',"EAN128A", order.delivery_number)//运单条码
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);

	LODOP.ADD_PRINT_TEXT('20mm','4mm','18mm','5mm','目的地:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('17mm','22mm','75mm','6mm',order.receive_province + order.receive_city + order.receive_district);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",20);
	
	LODOP.ADD_PRINT_TEXT('28mm','4mm','18mm','5mm','收件地址:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('28mm','22mm','75mm','10mm',order.receive_addr);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
	
	LODOP.ADD_PRINT_TEXT('38mm','4mm','18mm','5mm','收件人:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('38mm','22mm','18mm','5mm',order.receive_name);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('38mm','40mm','12mm','5mm','电话:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('38mm','52mm','35mm','10mm',order.receive_mobile);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	
	LODOP.ADD_PRINT_LINE('43mm','3mm','43mm','143mm',0,1);
	
	LODOP.ADD_PRINT_TEXT('45mm','4mm','18mm','5mm','寄件人:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('45mm','22mm','18mm','5mm',senderName);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('45mm','40mm','12mm','5mm','电话:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('45mm','52mm','35mm','5mm',senderPhone);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	
	LODOP.ADD_PRINT_TEXT('50mm','4mm','18mm','5mm','寄件地址:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('50mm','22mm','75mm','6mm',senderAddr);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	
	LODOP.ADD_PRINT_TEXT('56mm','4mm','18mm','5mm','内件品名:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('56mm','22mm','75mm','5mm','化妆品');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('61mm','4mm','18mm','5mm','订单号:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('61mm','22mm','75mm','5mm',order.order_id);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('66mm','4mm','27mm','5mm','计费重量(KG):');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('61mm','31mm','75mm','10mm','');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	
	LODOP.ADD_PRINT_TEXT('66mm','70mm','20mm','7mm','已验视');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",14);
	
	LODOP.ADD_PRINT_TEXT('73mm','60mm','25mm','6mm','收件人签名:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('80mm','65mm','35mm','6mm','年   月   日');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	
	LODOP.ADD_PRINT_TEXT('105mm','4mm','45mm','10mm','申通快递');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",22);
	LODOP.ADD_PRINT_BARCODE('105mm','50mm','50mm','10mm',"EAN128A", order.delivery_number)//运单条码

	LODOP.ADD_PRINT_TEXT('120mm','4mm','18mm','5mm','收件地址:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('120mm','22mm','75mm','7mm',order.receive_addr);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",11);	
	LODOP.ADD_PRINT_TEXT('127mm','4mm','18mm','5mm','收件人:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('127mm','22mm','25mm','5mm',order.receive_name);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('127mm','47mm','12mm','5mm','电话:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('127mm','59mm','35mm','5mm',order.receive_mobile);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

	LODOP.ADD_PRINT_TEXT('135mm','4mm','18mm','5mm','寄件人:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('135mm','22mm','25mm','5mm',senderName);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('135mm','47mm','12mm','5mm','电话:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('135mm','59mm','35mm','5mm',senderPhone);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('140mm','4mm','18mm','5mm','寄件地址:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_TEXT('140mm','22mm','75mm','5mm',senderAddr);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
}

//打印中通订单
Zhiwo.Delivery.printZto = function(order) {
	var senderName = Zhiwo.Delivery.getSenderName(order.channel);
	var senderPhone = Zhiwo.Delivery.getSenderPhone(order.channel);
	var senderAddr = Zhiwo.Delivery.getSenderAddr();

	LODOP.SET_PRINT_PAGESIZE(1, '103mm', '152.5mm', "");
	LODOP.ADD_PRINT_TEXT('3mm', '75mm', '24mm', '9mm', '中通快递');
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '12');
	LODOP.ADD_PRINT_LINE('10mm', '1mm', '10mm' ,'98mm',1, 1);
	
	LODOP.ADD_PRINT_TEXT('10mm', '3mm', '98mm', '14mm', order.delivery_bigpen ? order.delivery_bigpen : order.receive_city);
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '34');
	
	LODOP.ADD_PRINT_LINE('24mm', '1mm', '24mm' ,'98mm',1, 1);
	LODOP.ADD_PRINT_TEXT('25mm', '7mm', '80mm', '18mm', order.receive_name + '    ' + order.receive_mobile + "\n" + order.receive_addr);
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '13');
	
	LODOP.ADD_PRINT_LINE('24mm', '6mm', '54mm' ,'6mm',1, 1);
	LODOP.ADD_PRINT_TEXT('26mm', '2mm', '4mm', '18mm', '收件人');
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '8');
	LODOP.ADD_PRINT_TEXT('43mm', '2mm', '4mm', '12mm', '发件人');
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '8');
	
	LODOP.ADD_PRINT_LINE('42mm', '1mm', '42mm', '98mm',1, 1);
	LODOP.ADD_PRINT_TEXT('43mm', '7mm', '80mm', '10mm', senderName + '    ' + senderPhone + "\n" + senderAddr);
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '9');
	
	LODOP.ADD_PRINT_LINE('54mm', '1mm', '54mm', '98mm',1, 1);
	LODOP.ADD_PRINT_BARCODE('55mm','5mm','60mm','10mm',"128B", order.delivery_number)//单号条码
	
	LODOP.ADD_PRINT_LINE('65mm', '1mm', '65mm', '98mm',1, 1);
	LODOP.ADD_PRINT_LINE('65mm', '44mm', '90mm', '44mm',1, 1);
	
	LODOP.ADD_PRINT_TEXT('66mm', '2mm', '44mm', '20mm', '快件送达收件人地址，经收件人或收件人（寄件人）允许的代收件人签字，视为送达，您的签字代表您已验收此包裹，并以确认商品信息无误，包裹完好，没有划痕，裂损等');
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '6');
	LODOP.ADD_PRINT_TEXT('68mm', '46mm', '35mm', '18mm', "签收人：\n\n时间：");
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '9');
	
	LODOP.ADD_PRINT_TEXT('105mm', '4mm', '35mm', '10mm', "中通快递");
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '22');
	LODOP.ADD_PRINT_BARCODE('105mm','40mm','55mm','10mm',"128B", order.delivery_number);
	
	LODOP.ADD_PRINT_LINE('115mm', '1mm', '115mm', '98mm',1, 1);
	LODOP.ADD_PRINT_LINE('115mm', '6mm', '135mm', '6mm',1, 1);
	LODOP.ADD_PRINT_TEXT('120mm', '2mm', '4mm', '15mm', "收件人");
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '8');
	LODOP.ADD_PRINT_TEXT('117mm', '8mm', '74mm', '18mm', order.receive_name + '    ' + order.receive_mobile + "\n" + order.receive_addr);
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '10');
	LODOP.ADD_PRINT_LINE('135mm', '1mm', '135mm', '98mm',1, 1);
	LODOP.ADD_PRINT_LINE('135mm', '6mm', '150mm', '6mm',1, 1);
	LODOP.ADD_PRINT_TEXT('137mm', '2mm', '4mm', '20mm', "内容");
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '8');
	
	LODOP.ADD_PRINT_TEXT('137mm', '9mm', '90mm', '5mm','品名：化妆品');
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '8');
	LODOP.ADD_PRINT_TEXT('140mm', '75mm', '20mm', '6mm', "已验视");
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '10');
}

//打印百世快递
Zhiwo.Delivery.printBest = function(order) {
	var senderName = Zhiwo.Delivery.getSenderName(order.channel);
	var senderPhone = Zhiwo.Delivery.getSenderPhone(order.channel);
	var senderAddr = Zhiwo.Delivery.getSenderAddr();

	LODOP.SET_PRINT_PAGESIZE(1, '103mm', '152.5mm', "");

	//上联外边框
	LODOP.ADD_PRINT_LINE('1mm','3mm','1mm','98mm',0,2);
	LODOP.ADD_PRINT_LINE('1mm','3mm','86mm','3mm',0,2);
	LODOP.ADD_PRINT_LINE('1mm','98mm','86mm','98mm',0,2);
	LODOP.ADD_PRINT_LINE('86mm','3mm','86mm','98mm',0,2);
	
	LODOP.ADD_PRINT_TEXT('2mm','4mm','35mm','8mm','百世快递');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",22);	
	LODOP.ADD_PRINT_LINE('10mm','3mm','10mm','98mm',0,1);
	
	LODOP.ADD_PRINT_TEXT('11mm','4mm','70mm','6mm',order.bigchar);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",14);
	LODOP.ADD_PRINT_TEXT('11mm','70mm','40mm','6mm',order.sorting_code);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",14);
	LODOP.ADD_PRINT_LINE('17mm','3mm','17mm','98mm',0,1);
	
	LODOP.ADD_PRINT_TEXT('18mm','4mm','70mm','6mm',order.pkgCode);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",14);
	LODOP.ADD_PRINT_LINE('25mm','3mm','25mm','98mm',0,1);
	
	
	LODOP.ADD_PRINT_TEXT('26mm','4mm','5mm','12mm','收\n件');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_LINE('25mm','8mm','57mm','8mm',0,1);
	LODOP.ADD_PRINT_TEXT('26mm','9mm','18mm','5mm',order.receive_name);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('30mm','9mm','50mm','5mm','电话:'+order.receive_mobile);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('34mm','9mm','80mm','10mm','地址:'+order.receive_addr);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);	
	LODOP.ADD_PRINT_LINE('44mm','3mm','44mm','98mm',0,1);
	
	LODOP.ADD_PRINT_TEXT('45mm','4mm','5mm','12mm','寄\n件');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_LINE('45mm','8mm','57mm','8mm',0,1);
	LODOP.ADD_PRINT_TEXT('45mm','9mm','18mm','5mm',senderName);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('49mm','9mm','50mm','5mm','电话:'+senderPhone);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('53mm','9mm','80mm','5mm','地址:'+senderAddr);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_LINE('57mm','3mm','57mm','98mm',0,1);
	
	LODOP.ADD_PRINT_BARCODE('58mm','20mm','50mm','10mm',"128c", order.delivery_number)//运单条码
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

	LODOP.ADD_PRINT_LINE('69mm','3mm','69mm','98mm',0,1);
	
	LODOP.ADD_PRINT_TEXT('71mm','9mm','46mm','10mm','您对此单的签收，代表您已验收，确认商品信息无误，包装完好，没有划痕、破损等表面问题质量');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	
	LODOP.ADD_PRINT_LINE('69mm','55mm','86mm','55mm',0,1);
	LODOP.ADD_PRINT_TEXT('72mm','56mm','45mm','10mm','收件人签名:');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	
	//下联外边框
	LODOP.ADD_PRINT_LINE('95mm','3mm','95mm','98mm',0,2);
	LODOP.ADD_PRINT_LINE('95mm','3mm','138mm','3mm',0,2);
	LODOP.ADD_PRINT_LINE('95mm','98mm','138mm','98mm',0,2);
	LODOP.ADD_PRINT_LINE('138mm','3mm','138mm','98mm',0,2);
	
	LODOP.ADD_PRINT_TEXT('97mm', '4mm', '35mm', '10mm', "百世快递");
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '22');
	LODOP.ADD_PRINT_BARCODE('97mm','40mm','50mm','10mm',"128c", order.delivery_number);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

	LODOP.ADD_PRINT_LINE('108mm','3mm','108mm','98mm',0,1);
	LODOP.ADD_PRINT_TEXT('110mm','4mm','5mm','11mm','收\n件');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_LINE('108mm','8mm','125mm','8mm',0,1);
	LODOP.ADD_PRINT_TEXT('110mm','9mm','80mm','10mm',order.receive_addr);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('120mm','9mm','18mm','5mm',order.receive_name);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('120mm','30mm','50mm','5mm','电话:'+order.receive_mobile);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);

	LODOP.ADD_PRINT_LINE('125mm','3mm','125mm','98mm',0,1);
	LODOP.ADD_PRINT_TEXT('130mm','4mm','5mm','38mm','寄\n件');
	LODOP.SET_PRINT_STYLEA(0,"FontSize",9);
	LODOP.ADD_PRINT_LINE('125mm','8mm','138mm','8mm',0,1);
	LODOP.ADD_PRINT_TEXT('126mm','9mm','80mm','5mm','地址: '+senderAddr);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
	LODOP.ADD_PRINT_TEXT('131mm','9mm','50mm','5mm',senderName);
	LODOP.ADD_PRINT_TEXT('131mm','30mm','50mm','5mm','电话:'+senderPhone);
	LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
}

//打印宅急送货到付款
Zhiwo.Delivery.printZjsCOD = function(order) {
	var senderName = Zhiwo.Delivery.getSenderName(order.channel);
	var senderPhone = Zhiwo.Delivery.getSenderPhone(order.channel);
	
	var myDate = new Date();
	var myYear = myDate.getFullYear();
	var myMonth = parseInt(myDate.getMonth()) + 1;
	var myDay = myDate.getDate();
	
	var printDate = myYear+'-'+zeroize(myMonth)+'-'+zeroize(myDay);

	LODOP.SET_PRINT_PAGESIZE(1, '103mm', '152.5mm', "");
	LODOP.SET_PRINT_STYLE('FontSize', '10');
	
	LODOP.ADD_PRINT_TEXT('2mm', '3mm', '30mm', '14mm', '宅急送');
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '20');
	
	LODOP.ADD_PRINT_TEXT('2mm', '35mm', '65mm', '14mm', order.receive_city);
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '20');
	
	LODOP.ADD_PRINT_LINE('15mm', '1mm', '15mm' ,'100mm', 1, 1);
	
	LODOP.ADD_PRINT_TEXT('16mm', '2mm', '4mm', '20mm', '收货信息');
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '8');
	
	LODOP.ADD_PRINT_TEXT('16mm', '6mm', '93mm', '10mm', order.receive_addr);
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '13');
	
	LODOP.ADD_PRINT_TEXT('27mm', '6mm', '93mm', '8mm', order.receive_name  + '     ' + order.receive_mobile);
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '13');
	
	LODOP.ADD_PRINT_LINE('35mm', '1mm', '35mm' ,'100mm',1, 1);
	LODOP.ADD_PRINT_TEXT('36mm', '3mm', '39mm', '12mm', "受理单位:\n声明价值:" + order.total_amount);
	LODOP.ADD_PRINT_TEXT('48mm', '3mm', '39mm', '10mm', "代收:￥" + order.total_amount);
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '15');
	
	LODOP.ADD_PRINT_TEXT('36mm', '41mm', '28mm', '3mm', '宅急送号');
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '6');
	
	LODOP.ADD_PRINT_BARCODE('40mm','41mm','58mm','15mm',"EAN128A", order.delivery_number)//单号条码
	
	LODOP.ADD_PRINT_TEXT('56mm', '3mm', '30mm', '3mm', '客户订单号');
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '6');
	LODOP.ADD_PRINT_BARCODE('60mm','3mm','58mm','12mm',"EAN128A", order.order_id)//订单条码
	
	LODOP.ADD_PRINT_TEXT('56mm', '61mm', '38mm', '5mm', '收件人签名：');
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '10');
	LODOP.ADD_PRINT_TEXT('68mm', '75mm', '28mm', '7mm', '年  月  日');
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '10');
	
	LODOP.ADD_PRINT_TEXT('76mm', '3mm', '48mm', '13mm', '快件送达收件人地址，经收件人或收件人（寄件人）允许的代收件人签字，视为送达，您的签字代表您已验收此包裹，并以确认商品信息无误，包裹完好，没有划痕，裂损等');
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '6');
	
	LODOP.ADD_PRINT_TEXT('76mm', '50mm', '49mm', '13mm', senderName + "\n" + senderPhone);
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '12');
	
	LODOP.ADD_PRINT_TEXT('102mm', '3mm', '30mm', '9mm', '宅急送');
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '20');	
	LODOP.ADD_PRINT_TEXT('102mm', '71mm', '30mm', '9mm', printDate);
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '12');
	LODOP.ADD_PRINT_TEXT('111mm', '71mm', '30mm', '5mm', '品名：化妆品');
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '8');
	LODOP.ADD_PRINT_TEXT('117mm', '71mm', '30mm', '8mm', senderName + "\n" + senderPhone);
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '10');
	LODOP.ADD_PRINT_TEXT('126mm', '3mm', '98mm', '4mm', '快件送达收件人地址，经收件人或收件人（寄件人）允许的代收件人签字，视为送达');
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '6');
	
	LODOP.ADD_PRINT_TEXT('111mm', '3mm', '69mm', '18mm', "收货人：" + order.receive_name + "\n" + "客户单号:" + order.order_id + "\n宅急送号:" + order.delivery_number);
	LODOP.SET_PRINT_STYLEA(0, 'FontSize', '10');
	
	LODOP.ADD_PRINT_BARCODE('133mm','3mm','60mm','15mm', "EAN128A", order.delivery_number)//单号条码
}

//打印京东物流单
Zhiwo.Delivery.printJdCOD =  function(order) {
	var myDate = new Date();
	var myYear = myDate.getFullYear();
	var myMonth = parseInt(myDate.getMonth()) + 1;
	var myDay = myDate.getDate();

	var printDate = myYear+'-'+zeroize(myMonth)+'-'+zeroize(myDay);

	var receiveInfo = '<table style="font-family:黑体;font-size=11">';
	receiveInfo += '<tr><td>收件人:' + order.receive_name + '</td><td>电话:'+order.receive_mobile+'</td></tr>';
	receiveInfo += '<tr><td colspan="2">收件地址:'+order.receive_addr+'</td></tr></table>';

	var senderInfo = '<table style="font-family:黑体;font-size=10">';
	senderInfo += '<tr><td>寄件人:卓成</td><td >电话:01052975728</td></tr>';
	senderInfo += '<tr><td colspan="2">寄件地址:北京顺义区后沙峪地区沙峪铁匠营村 村委会东 斯特派物流9号库</td></tr></table>';

	LODOP.SET_PRINT_PAGESIZE(1,"104mm","116mm","");
	LODOP.SET_PRINT_STYLE("FontName",'黑体');
	LODOP.SET_PRINT_STYLE("FontSize",9);
	LODOP.ADD_PRINT_BARCODE("6mm","8mm","89mm","15mm","128A",order.delivery_number+'-1-1-');
	
	LODOP.ADD_PRINT_TABLE("23mm","7mm","68mm","20mm",receiveInfo);
	LODOP.ADD_PRINT_TABLE("43mm","7mm","68mm","20mm",senderInfo);
	
	LODOP.SET_PRINT_STYLE("FontSize",9);
	LODOP.ADD_PRINT_TEXT("23mm","75mm","30mm","6mm","代收金额");
	LODOP.SET_PRINT_STYLE("FontSize",11);
	LODOP.ADD_PRINT_TEXT("27mm","75mm","30mm","10mm","￥"+order.total_amount+"元");
	LODOP.SET_PRINT_STYLE("FontSize",20);
	LODOP.ADD_PRINT_TEXT("37mm","85mm","25mm","12mm","1-1");
	LODOP.SET_PRINT_STYLE("FontSize",9);
	LODOP.ADD_PRINT_TEXT("46mm","80mm","25mm","9mm","客户签字");
	LODOP.SET_PRINT_STYLE("FontSize",6);
	LODOP.ADD_PRINT_TEXT("60mm","65mm","25mm","4mm",printDate);

	LODOP.SET_PRINT_STYLE("FontSize",9);
	LODOP.ADD_PRINT_TEXT("65mm","40mm","50mm","7mm","运单号:"+order.delivery_number);
	
	LODOP.SET_PRINT_STYLE("FontSize",8);
	LODOP.ADD_PRINT_TABLE("70mm","7mm","68mm","20mm",receiveInfo);
	LODOP.ADD_PRINT_TABLE("90mm","7mm","68mm","20mm",senderInfo);
	LODOP.SET_PRINT_STYLE("FontSize",8);
	LODOP.ADD_PRINT_TEXT("75mm","75mm","25mm","5mm","代收金额");
	LODOP.SET_PRINT_STYLE("FontSize",11);
	LODOP.ADD_PRINT_TEXT("80mm","75mm","30mm","10mm","￥"+order.total_amount+"元");
	LODOP.SET_PRINT_STYLE("FontSize",6);
	LODOP.ADD_PRINT_TEXT("109mm","65mm","25mm","4mm",printDate);
}
//打印京东快递单
Zhiwo.Delivery.printJdExpressO =  function(order) {
	var myDate = new Date();
	var myYear = myDate.getFullYear();
	var myMonth = parseInt(myDate.getMonth()) + 1;
	var myDay = myDate.getDate();

	var printDate = myYear+'-'+zeroize(myMonth)+'-'+zeroize(myDay);

	var receiveInfo = '<table style="font-family:黑体;font-size=11">';
	receiveInfo += '<tr><td>收件人:' + order.receive_name + '</td><td>电话:'+order.receive_mobile+'</td></tr>';
	receiveInfo += '<tr><td colspan="2">收件地址:'+order.receive_addr+'</td></tr></table>';

	var senderInfo = '<table style="font-family:黑体;font-size=10">';
	senderInfo += '<tr><td>寄件人:卓成</td><td >电话:01052975728</td></tr>';
	senderInfo += '<tr><td colspan="2">寄件地址:北京顺义区后沙峪地区沙峪铁匠营村 村委会东 斯特派物流9号库</td></tr></table>';

	LODOP.SET_PRINT_PAGESIZE(1,"104mm","116mm","");
	LODOP.SET_PRINT_STYLE("FontName",'黑体');
	LODOP.SET_PRINT_STYLE("FontSize",9);
	LODOP.ADD_PRINT_BARCODE("6mm","8mm","89mm","15mm","128A",order.delivery_number+'-1-1-');
	
	LODOP.ADD_PRINT_TABLE("23mm","7mm","68mm","20mm",receiveInfo);
	LODOP.ADD_PRINT_TABLE("43mm","7mm","68mm","20mm",senderInfo);	

	LODOP.SET_PRINT_STYLE("FontSize",20);
	LODOP.ADD_PRINT_TEXT("37mm","85mm","25mm","12mm","1-1");
	LODOP.SET_PRINT_STYLE("FontSize",9);
	LODOP.ADD_PRINT_TEXT("46mm","80mm","25mm","9mm","客户签字");
	LODOP.SET_PRINT_STYLE("FontSize",6);
	LODOP.ADD_PRINT_TEXT("60mm","65mm","25mm","4mm",printDate);

	LODOP.SET_PRINT_STYLE("FontSize",9);
	LODOP.ADD_PRINT_TEXT("65mm","40mm","50mm","7mm","运单号:"+order.delivery_number);
	
	LODOP.SET_PRINT_STYLE("FontSize",8);
	LODOP.ADD_PRINT_TABLE("70mm","7mm","68mm","20mm",receiveInfo);
	LODOP.ADD_PRINT_TABLE("90mm","7mm","68mm","20mm",senderInfo);	
	LODOP.SET_PRINT_STYLE("FontSize",6);
	LODOP.ADD_PRINT_TEXT("109mm","65mm","25mm","4mm",printDate);
}