if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};
Zhiwo.GoodsType = {
	status: 0,
	currid: 0,
	onchange: 0,
	init: function() {
		$("a[id=deltype]").bind('click', function(){
			Zhiwo.GoodsType.currid = $(this).attr("tid");
			Zhiwo.GoodsType.cfmDialog();
		});
	},
	cfmDialog: function() {
		var dialog = KindEditor.dialog({
			width : 300,
			title : '提示信息',
			body : '<div id="cfmpanel" style="text-align:center"><br /><div id="showmsg">您确定要删除该类型吗？</div><br /><br /></div>',
			closeBtn : {
				name : '关闭',
				click : function(e) {
					dialog.remove();
				}
			},yesBtn : {
				name : '确定',
				click : function(e) {
					if (Zhiwo.GoodsType.status == 0) {
					$.get('/product/goodstype/del',{typeid:Zhiwo.GoodsType.currid}, function(data){
									if (data == 'success') {
										$("#cfmpanel #showmsg").html("操作成功");
										Zhiwo.GoodsType.status = 1;
									} else if (data == 'haskid') {
										$("#cfmpanel #showmsg").html("该类型有相关货品,操作失败");
									} else {
										$("#cfmpanel #showmsg").html("操作失败");
									}
								});
					} else {
						dialog.remove();
						location.href = '/product/goodstype';
					}
				}
			},
			noBtn : {
				name : '取消',
				click : function(e) {
					dialog.remove();
				}
			}
		});
	},
	editinit: function() {
		Zhiwo.GoodsType.onchange = $('input:radio[name="attribute"]:checked').val();
		$("input[name=attribute]").bind('change',function(e){
			var mid = $('input:radio[name="attribute"]:checked').val();
			if (typeof(Zhiwo.GoodsType.onchange)!='undefined' && Zhiwo.GoodsType.onchange != mid) {
				var dialog = KindEditor.dialog({
					width : 300,
					title : '提示信息',
					body : '<div id="cfmpanel" style="text-align:center"><br /><div id="showmsg">修改扩展属性将使商品扩展信息丢失</div><br /><br /></div>',
					closeBtn : {
						name : '关闭',
						click : function(e) {
							$('input:radio[name="attribute"][value='+ Zhiwo.GoodsType.onchange +']').click();
							dialog.remove();
						}
					},yesBtn : {
						name : '确定',
						click : function(e) {								
								Zhiwo.GoodsType.onchange = mid;
//								$("span").hide();
//								$(":radio:checked ~ span").show();
								dialog.remove();							
						}
					},
					noBtn : {
						name : '取消',
						click : function(e) {
							$('input:radio[name="attribute"][value='+ Zhiwo.GoodsType.onchange +']').click();
							dialog.remove();
						}
					}
				});
			} else {
				Zhiwo.GoodsType.onchange = mid;
			}
		});
	}
}