/**
 * 退货操作
 * author cj
 * date 2012/7/19
 */

if(!window.Zhiwo)
{
	window.Zhiwo = new Object();
}

Zhiwo.RefundOrder = {
	productInfo : [], //入库产品信息
	isConfirm : 0,
	isLoading : false,
	init : function()
	{
		$("a[id=confirmItem]").bind("click", Zhiwo.RefundOrder.openDialog);
		$("#export").bind("click", Zhiwo.RefundOrder.Export);
	},

	openDialog : function()
	{
		var dialogBody  = '<div id="add_returnedPurchase" itemid="' + $(this).attr("itemid")+ '" orderid="'+$(this).attr("orderid")+'" channel="'+$(this).attr("channel")+'" style="padding-top:10px;">';
			dialogBody += '<div id="errorMsg" style="width:740px;height:25px; margin:0px;padding:0px;margin-left:20px;clear:both;float:left;"><span></span>';
			dialogBody += '<input type="button" id="addRemarks" value="添加备注" style="float:right;" /></div></div>';
		var dialog = KindEditor.dialog({
			width : 850,
			title : '退货号 ' + $(this).attr("itemid") + ' &nbsp; 所退原订单号 ' + $(this).attr("orderid"),
			body  : dialogBody,
			closeBtn : 
			{
				name : "关闭",
				click : function(e)
				{
					dialog.remove();
					Zhiwo.RefundOrder.productInfo = [];
				}
			},
			yesBtn :
			{
				name : "确定",
				click : function(e)
				{
					if(Zhiwo.RefundOrder.isConfirm == 1)
					{
					   dialog.remove();
					   location.reload();
					}
					else
					{
					   if(confirm("你确定完成确认退货吗？退后不可恢复,请谨慎操作"))
					   {
						   Zhiwo.RefundOrder.productInfo = [];
						   var validate = Zhiwo.RefundOrder.validate();
						   if(validate)
						   {
							   //验证成功, 开始退货
							   $(".ke-dialog input[value=确定]").attr("disabled", true);
							   Zhiwo.RefundOrder.showMessage('正在提交中,请稍后...', 'blue', 0);
							   Zhiwo.RefundOrder.putInStorage();
						   }
					   }
					}
				}
			},
			noBtn  :
			{
				name : "取消",
				click : function(e)
				{
					Zhiwo.RefundOrder.productInfo = [];
					dialog.remove();
				}
			}
		});

		var orderStoreId = $(this).attr('storeid');

		$url = '/storage/refundorder/viewgoods?order_id='+$(this).attr("orderid")+'&randnum='+Math.random();
		$.get($url, function(res) {
			if (res.status == 'succ') {
				var tpl = $('#returnedPurchaseTpl').html();
				tpl = tpl.replace('data-house_code="'+ orderStoreId +'"', 'data-house_code="'+ orderStoreId +'" selected="selected"');
				var is_seaamoy = $("#add_returnedPurchase").attr("channel");
				var productDiv = '';

				for(var i=0; i<res.goodslist.length; i++) {
					productDiv  = '<div style="margin:10px;margin-left:30px;clear:both;width:740px;float:left;" ';
					productDiv += ' id="productReturn" product_name="' + res.goodslist[i].name + '" quantity="' + res.goodslist[i].quantity + '" sku="' + res.goodslist[i].sku + '"><hr />';
					productDiv += '<span style="color:blue;"><font color="black">退货sku名称：</font>' + res.goodslist[i].name;

					if(is_seaamoy == 'seaamoy' && i==0){
						productDiv += '  <font color="red">(海外购订单商品只能退回到知我仓)</font>';
					}

					productDiv += '<br /><font color="black">退货sku号：</font>'+ res.goodslist[i].sku + '<br />';
					productDiv += '<font color="black" id="quantity">退货sku数量：</font>' + res.goodslist[i].quantity +'</span>' + tpl +'</div>';

					$("#add_returnedPurchase").append(productDiv);
					$("#add_returnedPurchase :button[id=addItem]").unbind("click").bind("click", Zhiwo.RefundOrder.addItem);
					Zhiwo.RefundOrder.addDialogHeight(111, "add");
				}
			} else {
				Zhiwo.RefundOrder.showMessage('获取退货商品失败', 'red', 1);
			}
		});

		$(".ke-dialog-footer").first().css("float", "right");
		$("#add_returnedPurchase input[id=addRemarks]").bind("click", Zhiwo.RefundOrder.addRemarks);
	},

	//添加一个新的 退货归库选择菜单
	addItem : function()
	{
		var productReturnHouse = $(this).parent().parent();
		var houseCount = parseInt($("#returnedPurchaseTpl input[id=houseCount]").val());
		var len = productReturnHouse.find("div").length;
		if(len < houseCount)
		{
			var content = $("#returnedPurchaseTpl").html();
			productReturnHouse.append(content);
			productReturnHouse.find("div").last().append('<input type="button" value=" - " id="delItem" />');
			Zhiwo.RefundOrder.addItemInit();
			Zhiwo.RefundOrder.addDialogHeight(24, "add");
		}
		else
		{
			alert("一共就"+houseCount+"个仓库~ 不放加更多仓了")
		}
	},

	addItemInit : function()
	{
		var addItem = $("#add_returnedPurchase :button[id=addItem]");
			addItem.unbind("click");//取消以前绑定的方法，避免重复绑定
			addItem.bind("click", Zhiwo.RefundOrder.addItem);
		var delItem = $("#add_returnedPurchase :button[id=delItem]");
			delItem.unbind("click");
			delItem.bind("click", Zhiwo.RefundOrder.delItem);
	},

	delItem : function()
	{
		$(this).parent().remove();
		Zhiwo.RefundOrder.addDialogHeight(24, "del");
	},

	/*------------------------------增加对话框高度-------------------------------*/
	addDialogHeight : function(num, action)
	{
		var height = parseInt($(".ke-dialog").first().css("height"));
		if(action == "add")
		{
			$(".ke-dialog").first().css("height", height + num);
		}
		else
		{
			$(".ke-dialog").first().css("height", height - num);
		}
	},

	/*-----------------------------验证退货商品归库信息------------------------*/
	validate : function()
	{
		var flag = true;
		$("#add_returnedPurchase div[id=productReturn]").each(function(k){
			var pname = $(this).attr("product_name");
			var quantity = $(this).attr("quantity");
			var sku = $(this).attr("sku");
			var storeHouse = [];
			var _quantity = [];

			Zhiwo.RefundOrder.productInfo[k] = {};
			Zhiwo.RefundOrder.productInfo[k].pname = pname;
			Zhiwo.RefundOrder.productInfo[k].sku = sku;

			//验证数量
			var checkQuantity = 0;
			$(this).find("input[id=quantity]").each(function(i){
				val = $(this).val()
				if(val <= 0)
				{
					var msg = "请输入正确的入库数量--错误商品sku："+sku;
					Zhiwo.RefundOrder.showMessage(msg, "red", 1);
					return flag = false;
				}
				checkQuantity += parseInt(val);
				_quantity.push(val);
			});

			if(checkQuantity != quantity && flag == true)
			{
				var msg = '入库数量之和必须和退货数量' + quantity + '"相等！--错误商品sku：' + sku;
				Zhiwo.RefundOrder.showMessage(msg, "red", 1);
				return flag = false;
			}

			//验证仓库唯一性----一个仓库只能选择一次
			$(this).find("select[name=storeHouse]").each(function(i){
				var tmp = $(this).val()
				if(tmp == -1 && flag == true)
				{
					var msg = "请选择仓库--错误商品sku：" + sku;
					Zhiwo.RefundOrder.showMessage(msg, "red", 1);
					return flag = false;
				}
				if(flag == true)
				{
					if($.inArray(tmp, storeHouse) == -1)
					{
						storeHouse.push(tmp);
					}
					else
					{
						var msg = "选择的仓库不能重复！--错误商品sku：" + sku;
						Zhiwo.RefundOrder.showMessage(msg, "red", 1);
						return flag = false;
					}
				}
			});

			if(flag == true)
			{
				Zhiwo.RefundOrder.productInfo[k].store_house = storeHouse;
				Zhiwo.RefundOrder.productInfo[k].quantity = _quantity;
			}
			storeHouse = [];
			_quantity = [];
		});

		if(flag == false)
		{
			Zhiwo.RefundOrder.productInfo = [];
		}
		return flag;
	},

	//退货归库
	putInStorage : function()
	{
		if(Zhiwo.RefundOrder.isLoading == true){

			return false;
		}

		Zhiwo.RefundOrder.isLoading = true;

		var postData = {
			skus: Zhiwo.RefundOrder.productInfo,
			item_id: $("#add_returnedPurchase").attr("itemid"),
			order_id: $("#add_returnedPurchase").attr("orderid"),
			remarks: $("#add_returnedPurchase textarea[id=remarks]").val(),
			channel: $("#add_returnedPurchase").attr("channel")
		};

		$.post('/storage/refundorder/confirm', postData, function(data){

			Zhiwo.RefundOrder.isLoading = false;

			if(data.status == 'succ'){

				Zhiwo.RefundOrder.isConfirm = 1;
				Zhiwo.RefundOrder.showMessage("确认退货成功！", 'blue', 1);
				$(".ke-dialog input[value=确定]").attr("disabled", false);
				$(".ke-dialog input[value=确定]").val("返回");
			}
			else{

				Zhiwo.RefundOrder.showMessage(data.msg, 'red', 1);
			}
			$(".ke-dialog input[value=确定]").attr("disabled", false);
		});
	},

	//显示错误信息
	showMessage : function(msg, color, clear)
	{
		var error = $("#add_returnedPurchase div[id=errorMsg] span");
			error.html(msg);
			error.css("color", color);
			error.css("font-size", "20px");
			if(clear == 1)
			{
				Zhiwo.RefundOrder.productInfo = [];
			}
	},

	//添加备注
	addRemarks : function()
	{
		var len = $("#add_returnedPurchase textarea[id=remarks]").length;
		if(len > 0)
		{
			return false;
		}
		var textarea = '<textarea id="remarks" cols="80" rows="3" style="margin-left:40px;float:left;" placeHolder="请输入备注"></textarea>';
		$("#add_returnedPurchase").append(textarea);
		Zhiwo.RefundOrder.addDialogHeight(85, "add");
	},
	
	//导出退货单
	Export : function()
	{
		document.getElementById("schform").action="/storage/refundorder/export";
		$("#schform").submit();
	}

};

// 页面载入后初始化页面动作
$(function(){
	Zhiwo.RefundOrder.init();
});
