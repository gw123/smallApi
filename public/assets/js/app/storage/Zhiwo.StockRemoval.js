/**
 * 出库管理
 */

if(!window.Zhiwo)
{
	window.Zhiwo = new Object();
}

Zhiwo.StockRemoval = {
	choosed	   : 0,
	checkedProduct : [],//已经放入出库单的产品sku数组, 避免再次被选择
	index  : 0,			//产品数组索引偏移量
	isConfirm  : '',

	/*----------------初始化, 分配动作------------------------- */
	init:function() {
		//打开新建出库单
		$("#newExportList").bind("click", function(){
			Zhiwo.StockRemoval.openNewExport($(this).attr('act'), $(this).attr('title'), '0');
			$("#add_newExport input[id=chooseProduct]").bind("click", function(){
				Zhiwo.StockRemoval.openChoosePro();
			});
		});

		// 初始化审核,查看窗口
		$("a[id=checkExportList]").bind("click", function(){
			Zhiwo.StockRemoval.openNewExport($(this).attr('act'), $(this).attr('title'), $(this).attr('export_id'));
		});

		//初始化删除动作
		$("a[id=delExportList]").bind("click", function() {
			 var export_id = $(this).attr('export_id');
			 if(confirm('你确认删除' + export_id + '号出库单吗？'))
			 $.post('/storage/export/delexport', {export_id : export_id},function(data) {
				if(data == '1')	{
					alert('删除成功！');
					location.href = location.href;
				} else {
					alert('删除失败！');
				}
			 })
		});

		$("#calendar_div").css("z-index", 822222);
		$("input[name=recordTimeBegin]").calendar();
		$("input[name=recordTimeEnd]").calendar();
	},

	/*-----------打开一个创建出库单窗口------------------------- */
	openNewExport:function(act, title, id) {
		var planText = $("#openNewExport").html();
		var dialog = KindEditor.dialog({
			width : 800,
			title : title,
			body  : '<div id="add_newExport"><span id="errorMsg" style="margin-left:30px;font-size:20px;"></span>' + planText + '</div>',
			closeBtn  : {
				name : '关闭',
				click : function(e) {
					Zhiwo.StockRemoval.checkedProduct = [];
					Zhiwo.StockRemoval.index = 0;
					dialog.remove();
					}
			},
			yesBtn : {
					name : act,
					click: function() {
						if(act == '确定') {
							if(Zhiwo.StockRemoval.isConfirm == '1') {
								location.href = location.href;
								dialog.remove();
								Zhiwo.StockRemoval.checkedProduct = [];
								Zhiwo.StockRemoval.index = 0;
								Zhiwo.StockRemoval.isConfirm = '';
								return true;
							}
							Zhiwo.StockRemoval.addExport();
							$("#errorMsg").html('');
							if(Zhiwo.StockRemoval.isConfirm !== '1') {
								$("#errorMsg").html(Zhiwo.StockRemoval.isConfirm + "<br />");
								$("#errorMsg").css("color", "red");
							}
						} else {
							$("#errorMsg").html("正在提交中,请等候...<br />");
							$("#errorMsg").css("color", "blue");
							$(".ke-dialog input[value=审核]").attr("disabled", true);
							if(Zhiwo.StockRemoval.isConfirm == '1') {
								location.reload();
								dialog.remove();
								return true;
							}
							Zhiwo.StockRemoval.checkExport(id);
						}
					}
			},
			noBtn: {
					name : "取消",
					click: function() {
						Zhiwo.StockRemoval.checkedProduct = [];
						Zhiwo.StockRemoval.index = 0;
						dialog.remove();
					}
			}
		});
		$("#add_newExport input[id=recordTime]").calendar();
		if(act == '审核' || act == '返回') {
			Zhiwo.StockRemoval.initCheckExport(id, act);
		}
	},
	
	addExport: function() {
		var recordTime = $("#add_newExport input[id=recordTime]").val() || '';
		var exportType = $("#add_newExport select[id=exportType]").val() || 0;
		var houseCode = $("#add_newExport select[id=houseCode]").val() || 0;
		var remarks = $("#add_newExport textarea[id=remarks]").val() || ' ';
		if(recordTime == '' || exportType == 0 || houseCode == 0) {
		   return Zhiwo.StockRemoval.isConfirm = '标红色*为必填项';
		}
		var products = productsArr = [];
		var products = $.makeArray($("#add_newExport input[id=products]")) || '';
		if(products.length == 0) {
		   return Zhiwo.StockRemoval.isConfirm = '请选择货品';
		}

		for(var i = 0; i < products.length; i++) {
			var num = parseInt($(products[i]).val());
			if(num > 0) {	
				productsArr.push(num);
			}else {
				return Zhiwo.StockRemoval.isConfirm = '请添加出库数量';
			}
		}

		var addData = {recordTime:recordTime, exportType:exportType, houseCode:houseCode, sku:Zhiwo.StockRemoval.checkedProduct, quantity:productsArr, remarks:remarks};
		$.post('/storage/export/addexport', addData, function(data) {
			   Zhiwo.StockRemoval.isConfirm = data;
			   if(data == '1') {
					$("#errorMsg").html('创建出库单成功<br />');
					$("#errorMsg").css("color", "blue");
					var height = parseInt($(".ke-dialog").first().css("height"));
					$(".ke-dialog").first().css("height", height + 28);
			   } else {
					$("#errorMsg").html(data);
					$("#errorMsg").css("color", "red");
			   }
		})
	},

	/* ------------选择产品窗口 --------------------- */
	openChoosePro : function() {
		var planText = $('#choosePro').html();
		dialog = KindEditor.dialog({
			title : '选择货品',
			width : 800,
			body  : '<div id="add_choosePro" style="margin-left:5%;width:700px;">' + planText + '</div>',
			closeBtn : {
							name : '关闭',
							click : function(e) {
								dialog.remove();
							}
					   },
			yesBtn : {
						name: '确定',
						click : function(e) {
							var len = Zhiwo.StockRemoval.choosed;
							if(len > 0) {
								dialog.remove();
							} else {
								alert("请选择产品");
							}
						}
					},
			noBtn : {
						name: '取消',
						click : function(e) {
							dialog.remove();
						}
					}
		});

		$("#add_choosePro input[name=searchPro]").bind("click", function(){
			var sku = $("#add_choosePro input[name=sku]").val() || '';
			var pname = $("#add_choosePro input[name=pname]").val() || '';
			var houseCode = $("#add_newExport select[id=houseCode]").val() || 0;
			var url = '/storage/export/searchproduct?sku='+sku+'&pname='+pname+'&house_code='+houseCode;
			$("#add_choosePro iframe[id=productFrame]").attr("src", url);
		})
	},

	/*-----------------添加被选中的产品至 出库单窗口-------------*/
	addCheckedProduct : function(index) {
		var isChecked = $.inArray($(this).attr("sku"), Zhiwo.StockRemoval.checkedProduct);
		if(isChecked == -1) {
			Zhiwo.StockRemoval.checkedProduct.push($(this).attr("sku"));
			indexNo = index + Zhiwo.StockRemoval.index;
			var addrow  = '<tr><td>' + (indexNo+1) + '</td>';
				addrow += '<td>' + $(this).attr("sku") + '</td>';
				addrow += '<td>' + $(this).attr("pname") + '</td>';
				addrow += '<td><input type="text" name="products[' + $(this).val() + ']" id="products" size="6" maxlength="6" /></td>';
				addrow += '<td><a href="javascript:void(0)" id="delExportPro" indexNo="' + indexNo + '" pname="' + $(this).attr("pname") +'">删除</a></td></tr>';
			$("#add_newExport table[id=checkedProductTable]").append(addrow);
			var height = parseInt($(".ke-dialog").first().css("height"));
			$(".ke-dialog").first().css("height", height + 28);
			Zhiwo.StockRemoval.index++;
			$("#add_newExport a[id=delExportPro]").unbind("click",Zhiwo.StockRemoval.delExportPro).bind("click", Zhiwo.StockRemoval.delExportPro);
		}
	},

	/*----------------删除出库单中已经被选中的产品 ----*/
	delExportPro : function() {
		if(confirm('确定要从出库单中删除' + $(this).attr('pname') +'吗？')) {
			var indexNo = parseInt($(this).attr('indexNo'));
			Zhiwo.StockRemoval.checkedProduct.splice(indexNo, 1);
			$("#add_newExport a[id=delExportPro]").each(function(i) {
				var thisIndex = parseInt($(this).attr('indexNo'));
				if(thisIndex > indexNo) {
					$(this).attr("indexNo", thisIndex-1);
				}
		   });
			$(this).parent().parent().remove();
		}
	},
	
	/*------------- 初始化审核窗口 --------------------*/
	initCheckExport : function(id, act) {
		$.getJSON('/storage/export/exportinfo', {'export_id':id, 'random':Math.random()}, function(data) {
			var time = new Date(parseInt(data.record_time) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ');
			$("#add_newExport input[id=recordTime]").val(time).attr("disabled", true);
			$("#add_newExport select[id=exportType]").val(data.export_type).attr("disabled", true);
			$("#add_newExport select[id=houseCode]").val(data.house_code).attr("disabled", true);
			var remarks = $("#add_newExport textarea[id=remarks]");
			remarks.val(data.remarks);
			if(act == '返回') {
				remarks.attr('disabled', true);
			}

			$('#add_newExport input[id=chooseProduct]').hide();
			var exportStatus = parseInt(data.status);
			if(exportStatus == 1) {
				var statusInfo = '状态:已经审核，但只有部分出库';
			} else if(exportStatus == 2) {
				var statusInfo = '状态:已经审核，并完全出库';
				Zhiwo.StockRemoval.isConfirm = '1';
			} else {
				var statusInfo = '状态:未审核';
			}
			$('#add_newExport span[id=errorMsg]').text(statusInfo);
			var len = data.products.length;
			for (var i = 0; i < len; i++) {
				var addrow  = '<tr><td>' + (i + 1) + '</td><td>';
					addrow += data.products[i].sku + '</td><td>';
					addrow += data.products[i].name + '</td><td>';
					addrow += data.products[i].app_quantity + '</td><td>';
					addrow += data.products[i].out_quantity + '</td><td></td></tr>';
				$("#add_newExport table[id=checkedProductTable]").append(addrow);
				var height = parseInt($(".ke-dialog").first().css('height'));
				$(".ke-dialog").first().css("height", height + 28);
			}
		});
	},
	
	/*---------------  审核出库单 -------------------------------*/
	checkExport : function(id) {
		var remarks = $('#add_newExport textarea[id=remarks]').val();
		$.post('/storage/export/checkexport', {'export_id':id, 'remarks':remarks}, function(data) {
			var ret = eval("("+data+")"); 
			if(ret.status == 0) {
				Zhiwo.StockRemoval.isConfirm = '1';
				$('#errorMsg').html('审核出库成功'+ ret.error +'<br />');
				$('#errorMsg').css("color", "blue");
				$('.ke-dialog input[value=审核]').attr('disabled', false);
				$('.ke-dialog input[value=审核]').val('返回');
			} else {
				$('#errorMsg').html('审核出库失败'+ ret.error +'<br />');
				$('#errorMsg').css("color", "red");
				var height = parseInt($('.ke-dialog').first().css('height'));
				$('.ke-dialog').first().css('height', height + 28);
			}
		});
	}
}

$(function(){
	Zhiwo.StockRemoval.init();
})
