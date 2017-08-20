if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};
Zhiwo.supplierType = {
	currtype: 0,
	status: 0,
	init: function() {
		$("a[id=deltype]").each(function(){
				$(this).bind('click', function(){
						Zhiwo.supplierType.currtype = $(this).attr('tid');	
						Zhiwo.supplierType.cfmDialog();			   
					});			 
			});
	},
	cfmDialog: function() {
		var basehtml = $('#supplierinfo').html();
		var dialog = KindEditor.dialog({
			width : 300,
			title : '提示信息',
			body : '<div id="cfmpanel" style="text-align:center"><br /><div id="showmsg">您确定要删除改供应商类型吗？</div><br /><br /></div>',
			closeBtn : {
				name : '关闭',
				click : function(e) {
					dialog.remove();
				}
			},yesBtn : {
				name : '确定',
				click : function(e) {
					if (Zhiwo.supplierType.status == 0) {
					$.get('/purchase/supplier/type/delete',{tid:Zhiwo.supplierType.currtype}, function(data){
									if (data == 'success') {
										$("#cfmpanel #showmsg").html("操作成功");
										Zhiwo.supplierType.status = 1;
									} else if (data == 'haskid') {
										$("#cfmpanel #showmsg").html("该类型有相关供应商,操作失败");
									} else {
										$("#cfmpanel #showmsg").html("操作失败");
									}
								});
					} else {
						dialog.remove();
						location.href = '/purchase/supplier/type/list';
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
	}
}