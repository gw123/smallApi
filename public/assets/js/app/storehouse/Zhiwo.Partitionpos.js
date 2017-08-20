if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};
Zhiwo.PartitionPos = {
	posObj:{
		posid: 0,
		posname: '',
		houscode: '',
		remarks: ''
	},
	currid: 0,
	init: function() {
		$('a[id=editpos]').each(function(){
			$(this).bind('click', function() {
			Zhiwo.PartitionPos.clearPosObj();
			Zhiwo.PartitionPos.posObj.posid = $(this).attr('rposid');
			Zhiwo.PartitionPos.initPosObj();
			Zhiwo.PartitionPos.openEditPlan();
			Zhiwo.PartitionPos.initEditPlanV($(this).attr('status'));
			});
		});
		$('a[id=delpos]').each(function(){
			$(this).bind('click', function() {
				Zhiwo.PartitionPos.currid = $(this).attr('rposid');
				Zhiwo.PartitionPos.DelPos();
			});
		});
		$('#btaddpos').bind('click', function() {
			Zhiwo.PartitionPos.clearPosObj();
			Zhiwo.PartitionPos.openAddPlan();
		});
	},
	DelPos: function() {
		var isConfrim  = 0;
		var dialog = KindEditor.dialog({
			width : 500,
			title : '删除库位',
			body : '<div id="confrimpanel" style="text-align:center;"><br><br>确定删除吗?<br><br></div>',
			closeBtn : {
				name : '关闭',
				click : function(e) {
				dialog.remove();
				}
			},
			yesBtn : {
				name : '确定',
				click : function(e) {
					if (isConfrim == 0) {
						$("#confrimpanel").html('<br><br>doing...<br><br>');
						$.post('/storage/partitionpos/delete',{posid:Zhiwo.PartitionPos.currid}, function(rs){
							if(rs == 'success') {
								$("#confrimpanel").html('<br><br>操作成功<br><br>');
								isConfrim = 1;
							} else {
								$("#confrimpanel").html('<br><br>有对应产品,操作失败<br><br>');
							}
						});	
					} else if (isConfrim==1) {
						location.href = location.href;
						dialog.remove();	
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
	initPosObj: function() {
		var mid = $("#htm_value_"+Zhiwo.PartitionPos.posObj.posid).val();
		var mid_v = mid.split("|");
		Zhiwo.PartitionPos.posObj.posname = mid_v[0];
		Zhiwo.PartitionPos.posObj.houscode = mid_v[1];
		Zhiwo.PartitionPos.posObj.remarks = mid_v[2];	
	},
	initPlanV: function() {
		$("#htm_plan input[id=htm_posname]").val(Zhiwo.PartitionPos.posObj.posname);
		$("#htm_plan select[id=htm_houscode]").val(Zhiwo.PartitionPos.posObj.houscode);
		$("#htm_plan textarea[id=htm_remarks]").val(Zhiwo.PartitionPos.posObj.remarks);			
	},
	initEditPlanV: function(status) {
		$("#htm_plan input[id=htm_posname]").val(Zhiwo.PartitionPos.posObj.posname);
		if(status == "1") {
			$("#htm_plan input[id=htm_posname]").attr("disabled", true);
		}
		$("#htm_plan select[id=htm_houscode]").val(Zhiwo.PartitionPos.posObj.houscode);
		$("#htm_plan select[id=htm_houscode]").css({"display": "none"});
		$("#htm_plan textarea[id=htm_remarks]").val(Zhiwo.PartitionPos.posObj.remarks);
		$("#htm_plan span[id=optiontext]").html($("#htm_plan select[id=htm_houscode]").find("option:selected").text());
	},
    openEditPlan: function() {
		var plantext = $("#addplan").html();
		var dialog = KindEditor.dialog({
			width : 500,
			title : '修改库位',
			body : '<div id="htm_plan">' + plantext + '</div>',
			closeBtn : {
				name : '关闭',
				click : function(e) {
				dialog.remove();
				}
			},
			yesBtn : {
				name : '确定',
				click : function(e) {
				Zhiwo.PartitionPos.posObj.posname = $("#htm_plan input[id=htm_posname]").val();
				Zhiwo.PartitionPos.posObj.houscode = $("#htm_plan select[id=htm_houscode]").val();
				Zhiwo.PartitionPos.posObj.remarks = $("#htm_plan textarea[id=htm_remarks]").val();
				$.post('/storage/partitionpos/edit',{data:Zhiwo.PartitionPos.posObj}, function(rs){
						if(rs != '') {
							alert('操作成功');
							location.href = location.href;
							dialog.remove();
						}
					});
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
	openAddPlan: function() {
		var isDone = 0;
		var plantext = $("#addplan").html();
		var dialog = KindEditor.dialog({
			width : 500,
			title : '新增库位',
			body : '<div id="htm_plan">' + plantext + '</div>',
			closeBtn : {
				name : '关闭',
				click : function(e) {
					dialog.remove();
				}
			},
			yesBtn : {
				name : '确定',
				click : function(e) {
					if (isDone == 0) {
						$("#htm_plan span[id=msg]").html('');
						Zhiwo.PartitionPos.posObj.posname = $("#htm_plan input[id=htm_posname]").val();
						Zhiwo.PartitionPos.posObj.houscode = $("#htm_plan select[id=htm_houscode]").val();
						if (Zhiwo.PartitionPos.posObj.houscode == 0) {
							$("#htm_plan select[id=htm_houscode]").focus();
							$("#htm_plan span[id=msg]").html('请选择所属仓库');
							return false;	
						}
						Zhiwo.PartitionPos.posObj.remarks = $("#htm_plan textarea[id=htm_remarks]").val();
						$.post('/storage/partitionpos/edit',{data:Zhiwo.PartitionPos.posObj}, function(rs){
							if(rs == 'ISEXIST') {
								$("#htm_plan input[id=htm_posname]").focus();
								$("#htm_plan span[id=msg]").html('仓库的库位名称已存在，请重新输入库位名称。');
								return false;	
							} else if (rs == 'SUCCESS') {
								$("#htm_plan").html('<br><br><center>操作成功</center><br><br>');
								isDone = 1;
							} else {
								$("#htm_plan input[id=htm_posname]").focus();
								$("#htm_plan span[id=msg]").html('操作失败');
								return false;
							}
						});
					} else {
						location.href = location.href;
						dialog.remove();	
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
	clearPosObj: function() {
		Zhiwo.PartitionPos.posObj.posid = 0;
		Zhiwo.PartitionPos.posObj.posname = '';
		Zhiwo.PartitionPos.posObj.houscode = '';
		Zhiwo.PartitionPos.posObj.remarks = '';
	}
}
