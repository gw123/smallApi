if(!window.Zhiwo)
{
	window.Zhiwo = new Object();
}

Zhiwo.SplitOrder = {
	order_one : {goods_id : [], goods_quantity : [], amount : [], index : [], obj_type : []}, //保存拆分后的订单1数据,传给服务器用
	order_two : {goods_id : [], goods_quantity : [], amount : [], index : []}, //保存拆分后的订单2数据, 传给服务器用
	coupon : {},
	freight : {}, 
	isConfirm : 1,
	isLoading : false,
	splitInit : function()
	{
		$("#splitOrder").bind("click", function(){
			var splitQuantity = $("input[id=splitQuantity]");
			var splitTotalQuantity = 0;
			var totalQuantity = 0;
			var flag = true;
			splitQuantity.each(function(){
				var _splitQuantity = $(this).val();
				if(_splitQuantity < 0 || _splitQuantity == "")
				{
					msg = "错误提示：请输入正确的拆分数量！";
					Zhiwo.SplitOrder.showMessage(msg, 'red');
					return flag = false;
				}
				var oriQuantity = parseInt($(this).parent().siblings("#quantity").text());
				totalQuantity += oriQuantity;
				if(_splitQuantity > oriQuantity)
				{
					msg = "错误提示：拆分数量不能大于购买数量";
					Zhiwo.SplitOrder.showMessage(msg, 'red');
					return flag = false;
				}
				splitTotalQuantity += parseInt(_splitQuantity);
			});
				if(splitTotalQuantity == 0 && flag)
				{
					msg = "错误提示：拆分数量都为0的话不能拆分";
					Zhiwo.SplitOrder.showMessage(msg, 'red');
					return flag = false;
				}
				if(splitTotalQuantity == totalQuantity && flag)
				{
					msg = "错误提示：不允许全部拆分出去！";
					Zhiwo.SplitOrder.showMessage(msg, 'red');
					return flag = false;
				}

				if(flag)
				{
					Zhiwo.SplitOrder.splitOrder();
					Zhiwo.SplitOrder.childOrderInit(splitQuantity);
				}
		});
	},
	//拆分方法
	splitOrder : function()
	{
		var exists = $("#childOrder div[id=child_order_one]").length;
			if(exists > 0)
			{
				return false;
			}
			$("#errorMsg").html("&nbsp;");
			$("#splitOrder").attr("disabled", true);
			$("#childOrder div[id=order_info]").hide();
			var tplOne = $("#orderOneTpl").html();
			var tplTwo = $("#orderTwoTpl").html();
			$("#childOrder").append(tplOne);
			$("#childOrder").append(tplTwo);
			var confirmSplit = '<span id="operate">'+
							   '<input type="button" id="doSplit" value="确定拆分" />'+
							   '&nbsp;&nbsp;<input type="button" id="cancel" value="取消拆分" />&nbsp;&nbsp;</span>';
			$("#splitOrder").before(confirmSplit);
	},
	//初始化拆分
	childOrderInit : function(splitQuantity)
	{
		$("#orderInfo input[id=doSplit]").bind("click", function(){
			if(confirm("你确定开始拆分订单吗？") && Zhiwo.SplitOrder.isConfirm == 1)
			{
				$(this).hide();
				Zhiwo.SplitOrder.showMessage("正在提交中...，请稍候！", "blue");
				Zhiwo.SplitOrder.doSplit();
			}
		});
		$("#orderInfo input[id=cancel]").bind("click", function(){
			if(confirm("你确定取消拆分订单吗？"))
			{
				$("#childOrder div[id=child_order_one]").remove();
				$("#childOrder div[id=orderInfo_one]").remove();
				$("#childOrder div[id=child_order_two]").remove();
				$("#childOrder div[id=orderInfo_two]").remove();
				$("#orderInfo span[id=operate]").remove();
				$("#childOrder div[id=order_info]").show();
				$("#splitOrder").attr("disabled", false);
				Zhiwo.SplitOrder.order_one = {goods_id : [], goods_quantity : [], amount : [], index : [], obj_type : []};
				Zhiwo.SplitOrder.order_two = {goods_id : [], goods_quantity : [], amount : [], index : []};
		}
		});
		var order_one_total_amount = 0;
		var order_two_total_amount = 0;
		//为每个订单添加产品
		splitQuantity.each(function(){
				if($(this).val() >= 0)
				{
					var quantity = parseInt($(this).parent().siblings("#quantity").text());
					var goods = $(this).parent().siblings("#goods_id");
					var goodsId = goods.text();
					var index = goodsId + "_" + goods.attr("objtype");
					var name = $(this).parent().siblings("#name").text();
					var price = parseFloat($(this).parent().siblings("#price").text());
					var splitQuantity = $(this).val();				
					var orderOneAmount = price * (quantity - splitQuantity)
					order_one_total_amount += orderOneAmount;
					var orderOneRow = '<tr><td id="goods_id">' + goodsId + '</td><td>' + name +
									  '</td><td>￥ ' + price + '</td><td id="quantity">' + (quantity - splitQuantity) +
									  '</td><td>￥ ' + orderOneAmount + '</td></tr>';
					//往订单1里放数据
					Zhiwo.SplitOrder.order_one.goods_id.push(goodsId);
					Zhiwo.SplitOrder.order_one.index.push(index);
					Zhiwo.SplitOrder.order_one.obj_type.push(goods.attr("objtype"));
					Zhiwo.SplitOrder.order_one.goods_quantity.push(quantity - splitQuantity);
					Zhiwo.SplitOrder.order_one.amount.push(orderOneAmount);
				
					$("#childOrder div[id=child_order_one] table").append(orderOneRow);
					var orderTwoAmount = price * splitQuantity;
					order_two_total_amount += orderTwoAmount;
					var orderTwoRow = '<tr><td>' + goodsId + '</td><td>' + name +
									  '</td><td>￥ ' + price + '</td><td>' + splitQuantity +
									  '</td><td>￥ ' + orderTwoAmount + '</td></tr>';
					//往订单2里放数据
					Zhiwo.SplitOrder.order_two.goods_id.push(goodsId);
					Zhiwo.SplitOrder.order_two.index.push(index);
					Zhiwo.SplitOrder.order_two.goods_quantity.push(splitQuantity);
					Zhiwo.SplitOrder.order_two.amount.push(orderTwoAmount);

					$("#childOrder div[id=child_order_two] table").append(orderTwoRow);
				}
		});
		//得到原始订单信息
		var orderOnePercent = order_one_total_amount/(order_two_total_amount + order_one_total_amount);
		if(isNaN(orderOnePercent))
		{
			orderOnePercent = 0;
		}
		var ori_order_info = $("#childOrder div[id=order_info] table");
		var ori_order_freight = Math.round(parseFloat(ori_order_info.find("#freight span").text())*100)/100;
		var ori_order_coupon = Math.round(parseFloat(ori_order_info.find("#coupon_amount span").text())*100)/100;
		var ori_order_score_get = parseInt(ori_order_info.find("#score_get").text());
		Zhiwo.SplitOrder.freight = ori_order_freight;
		Zhiwo.SplitOrder.coupon = ori_order_coupon;

		//生成订单1信息
		var orderInfo_one = $("#childOrder div[id=orderInfo_one] table");
		var one_order_coupon = Math.round(orderOnePercent*ori_order_coupon*10)/10;
		var one_order_score_get = orderOnePercent*ori_order_score_get;
		orderInfo_one.find("#goods_amount").html('￥ '+ order_one_total_amount);
		Zhiwo.SplitOrder.order_one.goods_amount = order_one_total_amount;
		orderInfo_one.find("#freight input").val(ori_order_freight/2);
		Zhiwo.SplitOrder.order_one.freight = ori_order_freight/2;
		orderInfo_one.find("#coupon_amount input").val(one_order_coupon);
		Zhiwo.SplitOrder.order_one.coupon_amount = one_order_coupon;
		var one_order_total_amount = Math.round((order_one_total_amount + (ori_order_freight/2) - one_order_coupon)*100)/100;
		orderInfo_one.find("#total_amount").html('￥ '+ one_order_total_amount);
		Zhiwo.SplitOrder.order_one.total_amount = one_order_total_amount;
		orderInfo_one.find("#score_get").html(one_order_score_get);
		Zhiwo.SplitOrder.order_one.score_get = one_order_score_get;
		orderInfo_one.find("#coupon_amount input[name=coupon]").bind("focus", Zhiwo.SplitOrder.adjust_init);
		orderInfo_one.find("#freight input[name=freight]").bind("focus", Zhiwo.SplitOrder.adjust_init);
		
		//生成订单2信息
		var orderInfo_two = $("#childOrder div[id=orderInfo_two] table");
		var two_order_coupon = Math.round((ori_order_coupon - one_order_coupon)*10)/10;
		orderInfo_two.find("#goods_amount").html('￥ '+ order_two_total_amount);
		Zhiwo.SplitOrder.order_two.goods_amount = order_two_total_amount;
		orderInfo_two.find("#freight").html('￥ '+ (ori_order_freight/2));
		Zhiwo.SplitOrder.order_two.freight = ori_order_freight/2;
		orderInfo_two.find("#coupon_amount").html('￥ '+ two_order_coupon);
		Zhiwo.SplitOrder.order_two.coupon_amount = two_order_coupon;
		var two_order_total_amount = Math.round((order_two_total_amount + (ori_order_freight/2) - two_order_coupon)*100)/100;
		orderInfo_two.find("#total_amount").html('￥ '+ two_order_total_amount);
		Zhiwo.SplitOrder.order_two.total_amount = two_order_total_amount;
		orderInfo_two.find("#score_get").html(ori_order_score_get - one_order_score_get);
		Zhiwo.SplitOrder.order_two.score_get = ori_order_score_get - one_order_score_get;
	},
	//显示错误信息
	showMessage : function(msg, color)
	{
			$("#errorMsg").html(msg);
			$("#errorMsg").css("color", color);
	},
	//拆分动作
	doSplit : function()
	{
		if(Zhiwo.SplitOrder.isLoading == true){

			return false;
		}

		Zhiwo.SplitOrder.isLoading = true;

		var order_id = $("#parentOrderId").val();
		var url = '/transaction/order/split';

		Zhiwo.SplitOrder.order_one.store_id = $('td[name="old_store_id"]').attr('data-old_store_id');
		Zhiwo.SplitOrder.order_two.store_id = $('select[name="new_store_id"]').val();

		var order_one = Zhiwo.SplitOrder.order_one;
		var order_two = Zhiwo.SplitOrder.order_two;

		var data = {order_id:order_id, order_one:order_one, order_two:order_two};
		$.post(url, data, Zhiwo.SplitOrder.doSplitResult);
	},
	//处理拆分结果
	doSplitResult : function(json)
	{
		Zhiwo.SplitOrder.isLoading = false;

		if(json.status == "failure")
		{
			Zhiwo.SplitOrder.showMessage(json.errorMsg, 'red');
		}
		else if(json.status == "succ")
		{
			var msg = "拆单成功！源订单：" + json.ori_order + ", 新订单：" + json.new_order;
			Zhiwo.SplitOrder.showMessage(msg, 'blue');
			$("#orderInfo input[id=cancel]").hide();
		}
	},
	//调整 拆分订单的运费, 优惠券
	adjust_init : function() {
			var old_val = $(this).val();
			$(this).attr("id", old_val);
			$(this).unbind().bind("blur", Zhiwo.SplitOrder.adjust).bind('focus', Zhiwo.SplitOrder.adjust_init);
	}, 
	adjust : function()
	{
		var old_val = Math.round(parseFloat($(this).attr("id"))*100)/100;
		var new_val = Math.round(parseFloat($(this).val())*100)/100;
		
		var diff = Math.round((new_val - old_val)*100)/100;
		var orderInfo_one = $("#childOrder div[id=orderInfo_one] table");
		var orderInfo_two = $("#childOrder div[id=orderInfo_two] table");
		var type = $(this).attr("name");
		if(type == "freight")
		{
			if(new_val > Zhiwo.SplitOrder.freight || new_val < 0)
			{
				var msg = "物流费用填写错误！-- ￥" + new_val;
				Zhiwo.SplitOrder.showMessage(msg, "red");
				Zhiwo.SplitOrder.isConfirm = 0;
				$(this).attr("id", old_val);
				$(this).val(old_val);
				return false;
			}
			else
			{
//                $(this).attr("id", new_val);
				Zhiwo.SplitOrder.showMessage(" ", "red");
				Zhiwo.SplitOrder.isConfirm = 1;
			}
			Zhiwo.SplitOrder.order_one.freight += diff;
			Zhiwo.SplitOrder.order_two.freight -= diff;
			Zhiwo.SplitOrder.order_two.freight = Math.round(Zhiwo.SplitOrder.order_two.freight*100)/100;
			orderInfo_two.find("#freight").html('￥ '+ Zhiwo.SplitOrder.order_two.freight);
			Zhiwo.SplitOrder.order_one.total_amount += diff;
			Zhiwo.SplitOrder.order_two.total_amount -= diff;
		}
		else if(type == "coupon")
		{
			if(new_val > Zhiwo.SplitOrder.coupon || new_val < 0)
			{
				var msg = "优惠劵金额填写错误!-- ￥" + new_val;
				Zhiwo.SplitOrder.showMessage(msg, "red");
				Zhiwo.SplitOrder.isConfirm = 0;
				$(this).attr("id", old_val);
				$(this).val(old_val);
				return false;
			}
			else
			{
//                $(this).attr("id", new_val);
				Zhiwo.SplitOrder.showMessage(" ", "red");
				Zhiwo.SplitOrder.isConfirm = 1;
			}

			Zhiwo.SplitOrder.order_one.coupon_amount += diff;
			Zhiwo.SplitOrder.order_two.coupon_amount -= diff;
			Zhiwo.SplitOrder.order_two.coupon_amount = Math.round(Zhiwo.SplitOrder.order_two.coupon_amount*100)/100;
			Zhiwo.SplitOrder.order_one.total_amount -= diff;
			Zhiwo.SplitOrder.order_one.total_amount = Math.round(Zhiwo.SplitOrder.order_one.total_amount *100)/100;
			Zhiwo.SplitOrder.order_two.total_amount += diff;
			Zhiwo.SplitOrder.order_two.total_amount = Math.round(Zhiwo.SplitOrder.order_two.total_amount *100)/100;
			orderInfo_two.find("#coupon_amount").html('￥ '+ Zhiwo.SplitOrder.order_two.coupon_amount);
		}	
		Zhiwo.SplitOrder.order_one.total_amount = Math.round(Zhiwo.SplitOrder.order_one.total_amount *100)/100;
		Zhiwo.SplitOrder.order_two.total_amount = Math.round(Zhiwo.SplitOrder.order_two.total_amount *100)/100;

		orderInfo_one.find("#total_amount").html('￥ '+ Zhiwo.SplitOrder.order_one.total_amount);
		orderInfo_two.find("#total_amount").html('￥ '+ Zhiwo.SplitOrder.order_two.total_amount);
	}

};
