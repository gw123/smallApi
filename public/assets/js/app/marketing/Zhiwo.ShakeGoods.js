/*
 * =====================================================================================
 *
 *       Filename:  Zhiwo.shakeGoodsChoosen.js
 *
 *    Description:  知我后台摇一摇选品
 *
 *        Version:  1.0
 *        Created:  2012/11/8 星期四 15:41:48
 *       Revision:  none
 *
 *         Author:  cj 
 *        Company:  zhiwo
 *
 * =====================================================================================
 */
if(!window.Zhiwo)
{
	window.Zhiwo = new Object();
};
Zhiwo.ShakeGoods = {
	//初始化
	init : function()
	{
		$("a[id=coupon_goods]").bind("click", Zhiwo.ShakeGoods.addGoods);
		$("a[id='gift']").bind("click", Zhiwo.ShakeGoods.addGoods);
		$("a[id='price']").bind("click", Zhiwo.ShakeGoods.opDialog);
		$("a[id='detail']").bind("click", Zhiwo.ShakeGoods.opDialog);
		$("a[id=big_prize]").bind("click", Zhiwo.ShakeGoods.bigPrize);
	}, 
	//添加选品
	addGoods : function()
	{
		var type = $(this).attr("id");
		var goodsId = $(this).parent().siblings("td[name='goodsId']").text();
		var goodsName = $(this).parent().siblings("td[name='name']").text();
		var marketPrice = $(this).parent().siblings("td[name='price']").text();
		var action = $(this).attr("name");
		var url = "/marketing/app/shake/selection?random=" + Math.random();
		var params = {goodsId:goodsId, goodsName:goodsName, marketPrice:marketPrice, type:type, action:action};
		$(this).hide();
		$.getJSON(url, params, function(result){
			if(result.status == '1')
			{
				location.reload();
			}
			else
			{
				alert(goodsName + "加入摇一摇失败！" + result.info);
			}
		});
	},

	//操作小窗口--改价格, 改商品详情
	opDialog : function()
	{
		var type = $("input[name='type']").val();
		var subcat = $(this).attr('id');
		var value = $(this).text();
		var id = $(this).attr('name');
		if(subcat == 'price')
		{
			var width = 200;
			var title = '修改价格窗口';
			var body = '请输入新价格：<input name="price" size="6" value="' + value + '">';
			var yesFunction = Zhiwo.ShakeGoods.changePrice;
		}
		else if(subcat == 'detail')
		{
			var width = 400;
			var title = '修改商品详情窗口';
			var body = '<textarea name="detail" cols="40" rows="4">' + $.trim(value) + '</textarea>';
			var yesFunction = Zhiwo.ShakeGoods.updateDetail;
		}

		var dialog = KindEditor.dialog({
			width : width,
			title : title,
			body : '<div id="opDialog" style="padding:20px;">' + body +'</div>',
			closeBtn : {
							name : '关闭',
							click : function(e){
								dialog.remove();
							}
					   }, 
			   yesBtn: {
						 name: '确定', 
						 click :function(e){
							 yesFunction(id);
						 }
					   },
			    noBtn: {
						   name: '返回',
						  click: function(e){
							  dialog.remove();
						  }
					   }
		});
	},

	//更改价格
	changePrice : function(id)
	{
		var item = $("#opDialog input[name='price']");
		var newPrice = item.val();
		if(confirm("你确定修改价格为" + newPrice + "吗？"))
		{
			if(isNaN(parseFloat(newPrice)) || newPrice == 0)
			{
				alert("请输入正确的价格");
				return false;
			}

			$(".ke-dialog span[title='确定']").hide();
			var url = '/marketing/app/shake/updateprice?random=' + Math.random();
			var params = {price:newPrice, id:id};
			$.post(url, params, function(re){
				if(re == 1)
				{
					location.reload();
				}
				else
				{
					alert('更新价格失败！');
				}
			});
		}
	},

	//更新商品说明
	updateDetail : function(id)
	{
		if(confirm("你确定修改吗？"))
		{
			$(".ke-dialog span[title='确定']").hide();
			var detail = $("#opDialog textarea[name='detail']").val();
			var url = '/marketing/app/shake/updatedetail?random=' + Math.random();
			var params = {id:id, detail:detail};
			$.post(url, params, function(re){
				if(re == 1)
				{
					location.reload();
				}
				else
				{
					alert("更新商品说明失败！");
				}
			});
		}
	},

	//开启或关闭神秘大奖
	bigPrize : function()
	{
		$(this).hide();
		var goods = $(this).attr("name");
		var url = '/marketing/app/shake/bigprize?random=' + Math.random();
		var params = {goods : goods};
		$.post(url, params, function(res){
			if(res == '1')
			{
				location.reload();
			}
			else
			{
				alert("更新失败");
			}
		});
	}
};

$(function(){
	Zhiwo.ShakeGoods.init();
});
