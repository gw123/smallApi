if (!window.Zhiwo) {
	window.Zhiwo = new Object();
};
Zhiwo.Applisales = {
	init: function() {
		$("input[name='channel[]']").change(function() {
			Zhiwo.Applisales.changeChannelHandle();
		});
		$("input[name='seaamoy_price']").keyup(function(){
			var seaamoy_price = $(this).val();
			var cost_price = $(this).parent().parent().find('.cost_price').html();
			if (seaamoy_price < ~~cost_price) {
				alert('海淘价低于成本价,请谨慎填写.');
			}
		});
//		$("input[name='group_price']").keyup(function() {
//			var group_price = $(this).val();
//			var cost_price = $(this).parent().parent().find('.cost_price').html();
//			if (group_price < ~~cost_price) {
//				alert('团购价低于成本价,请谨慎填写.');
//			}
//		});
	},
	changeChannelHandle: function() {
		var shangcheng = $("input[name='channel[]']").eq(0).attr('checked');
		var tuangou = $("input[name='channel[]']").eq(1).attr('checked');
		$('#selectedGoods td').show();
		$('#selectedGoods td').find('input').attr('disabled', false);
		if (!shangcheng && tuangou) {
			_remove('#sale_price_col');
			$("input[name='channeltype']").val(2);
		} else if (!tuangou && shangcheng) {
			_remove('#group_price_col');
			if($('#sales_time_col').length > 0){
				_remove('#sales_time_col');
			}
			$("input[name='channeltype']").val(1);
		} else if (tuangou && shangcheng) {
			$("input[name='channeltype']").val(3);
		} else {
			_remove('#sale_price_col');
			_remove('#group_price_col');
			if($('#sales_time_col').length > 0){
				_remove('#sales_time_col');
			}
			$("input[name='channeltype']").val('4');
		}
	},
	bindApplySalesAdd: function() {
		$('.applySalesAdd').click(function () {
			var t = $(this);
			var url = '/product/applysales/seaamoyadd';
			var buyer = $("select[name='buyer']").val();
			var $tr = t.parent().parent();
			var goods_id = $tr.find("input[name='goods_id']").val();
			var market_price = $tr.find("input[name='market_price']").val()-0;
			var seaamoy_price = $tr.find("input[name='seaamoy_price']").val()-0;
			var group_price = $tr.find("input[name='group_price']").val()-0;
			var mall_price = $tr.find("input[name='mall_price']").val()-0;
			var lowest_price = $tr.find("input[name='lowest_price']").val()-0;
			var start_time = $("input[name='uptime']").val();
			var end_time = $("input[name='downtime']").val();
			
			var cost_price = $tr.find('.cost_price').text() - 0;
			if(cost_price > seaamoy_price){
				if(!confirm("海淘价格比成本价还低，还确认申销吗？")){
					return false;
				}
			}
			if ($("input[name='channeltype']").val() == '') {
				alert('请选择申销平台'); return false;
			} else {
				var channeltype = $("input[name='channeltype']").val();
			}
			if (buyer == '') {
				alert('请选择采购员'); return false;
			}
//			if (market_price == '') {
//				alert('请填写市场价'); return false;
//			}
			if (channeltype == 2 || channeltype == 3) {
				if (start_time == '') {
					alert('请选择上架时间'); return false;
				}
				if (end_time == '') {
					alert('请选择下架时间'); return false;
				}
				if (group_price == '') {
					alert('请填写团购价'); return false;
				}
			}
			if ((channeltype == 1 || channeltype == 3) && mall_price == '') {
				alert('请填写商城价'); return false;
			}
			var data = 'channeltype='+channeltype+'&buyer='+buyer+'&goods_id='+goods_id+'&market_price='+market_price+'&lowest_price='+lowest_price;
			if (channeltype == 1) {
				data += '&mall_price='+mall_price;
			} else if (channeltype == 2) {
				data += '&group_price='+group_price+'&start_time='+start_time+'&end_time='+end_time;
			} else if (channeltype == 3) {
				data += '&mall_price='+mall_price+'&group_price='+group_price+'&start_time='+start_time+'&end_time='+end_time;
			}else if(channeltype == 4){
                            data += '&seaamoy_price='+seaamoy_price;
                        }
			var respHandle = function(data) {
				if(data == 'success') {
					t.parent().html('<span style="color: red">申销成功</span>');
				} else {
					alert(data);
				}
			}
			$.post(url, data, respHandle);
			return false;
		});
	},
	bindApplySalesEdit: function() {
		$('.applySalesEdit').click(function () {
			var t = $(this);
			var url = '/product/applysales/edit';
			var goods_id = t.parent().parent().find("input[name='goods_id']").val();
			var market_price = t.parent().parent().find("input[name='market_price']").val();
			var group_price = t.parent().parent().find("input[name='group_price']").val();
			var seaamoy_price = t.parent().parent().find("input[name='seaamoy_price']").val();
			var start_time = t.parent().parent().find("input[name='start_time']").val();
			var end_time = t.parent().parent().find("input[name='end_time']").val();
//			if ($.trim(market_price) == '') {
//				alert('请填写市场价'); return false;
//			}
//			if (market_price <= 0) {
//				alert('市场价不能小于等于0'); return false;
//			}
//			if ($.trim(group_price) == '') {
//				alert('请填写团购价'); return false;
//			}
//			if (group_price <= 0) {
//				alert('团购价不能小于等于0'); return false;
//			}
			var data = 'goods_id='+goods_id+'&start_time='+start_time+'&end_time='+end_time+'&group_price='+group_price+'&market_price='+market_price+'&seaamoy_price'+seaamoy_price;
			var respHandle = function(data) {
				alert(data);
			}
			$.post(url, data, respHandle);
			return false;
		});
	}
}

function _remove(obj){
	var idx = $( "#selectedGoods tr:first td").index($(obj));
	$('#selectedGoods tr').each(function(){
		$(this).children('td').eq(idx).hide();
		$(this).children('td').eq(idx).find('input').attr('disabled', true);
	});
}