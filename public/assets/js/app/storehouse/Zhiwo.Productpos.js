if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};
Zhiwo.Productpos = {
	sku: '',
	posname: '',
	houseid: 0,
	index:0,
	init: function() {
		$('#btaddpos').bind('click', function() {
			Zhiwo.Productpos.clearData();
			Zhiwo.Productpos.openAddPlan();
		});
		$('a[id=delpos]').each(function(){
			$(this).bind('click', function() {
				Zhiwo.Productpos.posname = $(this).attr('pname');
				Zhiwo.Productpos.houseid = $(this).attr('hid');
				Zhiwo.Productpos.sku = $(this).attr('sku');
				Zhiwo.Productpos.delPosSKU();
			});
		});

		/**
		 * 添加从库位绑定方法
		 * date 2012/8/7
		 * authro cj
		 */
		$('a[id=add_affiliated_pos]').bind('click', Zhiwo.Productpos.add_affiliated_pos);
		$("a[id=del_affiliated_pos]").bind("click", Zhiwo.Productpos.del_affiliated_pos);
		$("a[id=modifi_affiliated_pos]").bind("click", Zhiwo.Productpos.modifi_affiliated_pos);
		/**
		 * 修改商品和库位对应关系
		 * aurhor cj
		 * date 2012/6/19
		 */
		$('a[id=editpos]').each(function(){
			Zhiwo.Productpos.clearData();
			$(this).bind('click', function(){
				Zhiwo.Productpos.sku = $(this).attr('sku');
				Zhiwo.Productpos.houseid = $(this).attr('hid');
				Zhiwo.Productpos.index = $(this).attr('index');
				Zhiwo.Productpos.openEditPlan();
				$("input[name='htm_sku']").val(Zhiwo.Productpos.sku);
				$("#htm_plan input[id=htm_sku]").attr('disabled', true);
			})
		});
	},

	initPosSelect: function() {
		$("#htm_plan td[id=htm_pos]").html('');
		if (Zhiwo.Productpos.houseid == 0) {
			Zhiwo.Productpos.houseid = $("#htm_plan select[id=htm_house]").val();	
		} else {
			$("#htm_plan select[id=htm_house]").val(Zhiwo.Productpos.houseid);
		}
		var typeid = $("#typeid").val();
		$.getJSON('/storage/partitionpos/usablelist',{housecode:Zhiwo.Productpos.houseid,typeid:typeid,random:Math.random()}, function(data){
			if (data != null) {
				var midPosPlan = '<select id="htm_pos_select">';
				$.each(data,function(i,item){
					midPosPlan += '<option value="' + item.pos_name + '">' + item.pos_name + '</option>';	
				});
				midPosPlan += '</select>';
				$("#htm_plan td[id=htm_pos]").html(midPosPlan);
				if(Zhiwo.Productpos.posname != '') {
					$("#htm_pos_select").val(Zhiwo.Productpos.posname);
				}
			}
		});
	},

	initHouseChange: function(){
		$("#htm_plan select[id=htm_house]").change(function(){
				Zhiwo.Productpos.clearData();
				Zhiwo.Productpos.houseid = $("#htm_plan select[id=htm_house]").val();
				Zhiwo.Productpos.initPosSelect();
			}).trigger("change");
	},

	clearData: function(){
		Zhiwo.Productpos.houseid = 0;
		Zhiwo.Productpos.posname = '';	
	},

	openAddPlan: function() {
		var isconfirm = 0;
		var plantext = $("#htm_add_plan").html();
		var dialog = KindEditor.dialog({
			width : 350,
			title : '新建货品与库位关联',
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
					if (isconfirm == 0) {
						$("#htm_plan span[id=msg]").html('');
						var sku = $("#htm_plan input[id=htm_sku]").val();
						var houseid = $("#htm_plan select[id=htm_house]").val();
						var posname = $("#htm_plan select[id=htm_pos_select]").val();
						if (sku == '') {
							$("#htm_plan span[id=msg]").html('SKU不能为空');
							return false;						
						}
						if (typeof(posname) == "undefined") {
							$("#htm_plan span[id=msg]").html('库位为必选项');
							return false;
						}
						$.get('/storage/productpos/add',{sku:sku, housecode:houseid, posname:posname, random:Math.random()}, function(data){
							if (data == '1') {
								isconfirm = 1;
								$("#htm_plan").html('<br><br><center>操作成功</center><br><br>');
							} else {
								$("#htm_plan span[id=msg]").html(data);
							}
						});	
					} else {
						location.href = location.href;
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
		Zhiwo.Productpos.initHouseChange();
	},

	openEditPlan: function() 
	{
		var isConfirm = 0;
		var planText = $("#htm_add_plan").html();
		var dialog = KindEditor.dialog({
			width : 350,
			title : '修改货品库位',
			body : '<div id="htm_plan">' +  planText + '</div>',
			closeBtn : {
				name : '关闭',
				click : function(e) {
				location.href = location.href;
				dialog.remove();
				}
			},
			yesBtn : {
				name : '确认',
				click : function(e) {
					var posname = $("#htm_plan select[id=htm_pos_select]").val();
					if (isConfirm == 0) {
						$.get('/storage/productpos/edit',{id:Zhiwo.Productpos.index, sku:Zhiwo.Productpos.sku,posname:posname, housecode:Zhiwo.Productpos.houseid, random:Math.random()}, function(data){
						if(data == '1')
						{
							$("#htm_plan").html('修改成功');
							isConfirm = 1;
						}
						else 
						{
							$("#htm_plan span[id=msg]").html(data);

						}
						
						});	
					} else {
						location.href = location.href;
						dialog.remove();
					}
				}
			},
			noBtn : {
				name : '返回',
				click : function(e) {
				location.href = location.href;
				dialog.remove();
				}
			}
		});	
		Zhiwo.Productpos.initHouseChange();
	},
	
	delPosSKU: function() {
		var isConfirm = 0;
		var dialog = KindEditor.dialog({
			width : 350,
			title : '删除货品库位关联',
			body : '<div id="confirmpanel"><br><br><center>确定要删除吗?</center><br><br></div>',
			closeBtn : {
				name : '关闭',
				click : function(e) {
				dialog.remove();
				}
			},
			yesBtn : {
				name : '确定',
				click : function(e) {
					if (isConfirm == 0) {
						$.get('/storage/productpos/delete',{sku:Zhiwo.Productpos.sku, housecode:Zhiwo.Productpos.houseid, posname:Zhiwo.Productpos.posname, random:Math.random()}, function(data){
								if (data == '1') {
									$('#confirmpanel').html('<br><br><center>删除成功</center><br><br>');
									isConfirm = 1;
								} else if (data == '-2') {
									$('#confirmpanel').html('<br><br><center>该产品有库存,不可以删除库位</center><br><br>');
									isConfirm = 1;
								} else {
									$('#confirmpanel').html('<br><br><center>'+data+'</center><br><br>');
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
	
	add_affiliated_pos : function()
	{
		var isConfirm = 0;
		var dialog = KindEditor.dialog({
			title : "添加从库位", 
			width : 350,
			height: 200, 
			body : '<div id="add_affiliated_pos" style="margin:10px;margin-left:30px;"><div id="errorMsg" style="height:25px;margin:5px;"></div></div>',
			closeBtn : {
				name : '关闭',
				click : function(e) {
				location.href = location.href;
				dialog.remove();
				}
			},
			yesBtn : {
				name : '确定',
				click : function(e) {
					$(".ke-dialog-footer span[title=确定]").hide();
					var pos_info = $("div[id=add_affiliated_pos] select").val();
					if(pos_info == -1)
					{
						Zhiwo.Productpos.showMessage("请选择正确库位", "red");
						$(".ke-dialog-footer span[title=确定]").show();
						return false;
					}

					$.post('/storage/partitionpos/addaffiliatedpos', {sku:sku, pos_info:pos_info, random:Math.random()}, function(json){
						if(json == "success")
						{
							Zhiwo.Productpos.showMessage("操作成功！", "blue");
						}
						else
						{
							Zhiwo.Productpos.showMessage("操作失败！", "red");
							$(".ke-dialog-footer span[title=确定]").show();
						}
					});
				}
			},
			noBtn : {
				name : '返回',
				click : function(e) {
					dialog.remove();
					location.reload();
				}
			}
		});
		
		//初始化流通仓库位
		var sku = $(this).parent().siblings("#sku").text();
		var pos_name = $(this).attr("pos");
		$.getJSON('/storage/partitionpos/usablelist',{housecode:$(this).attr("name"),typeid:$(this).attr("type"), random:Math.random()}, function(data){
				if (data != null) {
					var midPosPlan = '主库位：'+pos_name+'<br /><br />'+
									'从库位：<select id="' + sku + '">' +
									'<option value="-1">--请选择--</option>';
					$.each(data,function(i,item){
						midPosPlan += '<option value="' + item.pos_id + '_' + item.pos_name + '">' + item.pos_name + '</option>';	
					});
					midPosPlan += '</select>';
					$("div[id=add_affiliated_pos]").append(midPosPlan);
				}
		});
	}, 

	del_affiliated_pos : function()
	{
		var pos_name = $(this).attr("pos");
		if(confirm("你确定删除库位" + pos_name + "的从库位吗？"))
		{
			var sku = $(this).attr("sku");
			var affiliated = $(this).attr("affiliated");
			var url = "/storage/partitionpos/delaffiliatedpos?random=" + Math.random();
			$.post(url, {sku:sku, pos_name:pos_name, affiliated:affiliated}, function(data){
				if(data == 1)
				{
					alert("删除成功");
					location.reload();
				}
				else
				{
					alert("删除失败");
				}
			});
		}
	},

	modifi_affiliated_pos : function()
	{
		var sku = $(this).attr("sku");
		var pos_name = $(this).attr("pos");
		var affiliated = $(this).attr("affiliated");
		if(confirm("你确定修改库位" + pos_name + "的从库位吗？"))
		{
			var dialog = KindEditor.dialog({
				title : "修改从库位",
				width : 250,
				height: 150,
				body : '<div id="modifi_affiliated_pos" style="margin:10px;margin-left:30px;"><div id="errorMsg" style="height:30px;margin:5xp;"></div></div>',
				closeBtn : {
					name : "关闭",
					click: function(e)
					{
						dialog.remove();
						location.reload();
					}
				},
				yesBtn : {
					name : "修改",
					click: function(e)
					{
						$(".ke-dialog-footer span[title=修改]").hide();
						var pos_info = $("div[id=modifi_affiliated_pos] select").val();
						if(pos_info == -1)
						{
							Zhiwo.Productpos.showMessage("请选择正确库位", "red");
							$(".ke-dialog-footer span[title=修改]").show();
							return false;
						}
						var url = "/storage/partitionpos/modifiaffiliatedpos?random=" + Math.random();
						$.post(url, {sku:sku, pos_name:pos_name, affiliated:affiliated, pos_info: pos_info}, function(data){
							if(data == 1)
							{
								Zhiwo.Productpos.showMessage("修改成功", "blue");
							}
							else if(data == -1)
							{
								Zhiwo.Productpos.showMessage("删除旧从库位失败！", "red");
							}
							else if(data == 0)
							{

								Zhiwo.Productpos.showMessage("添加从库位失败！", "red");
							}
						});
					}
				}, 
				noBtn : {
					name : "返回",
					click: function(e)
					{
						dialog.remove();
						location.reload();
					}
				}
			});
			$.getJSON('/storage/partitionpos/usablelist',{housecode:$(this).attr("name"),typeid:$(this).attr("type")}, function(data){
				if (data != null) {
					var midPosPlan = '仓库名称：<select id="' + sku + '">' +
									 '<option value="-1">--请选择--</option>';
					$.each(data,function(i,item){
						midPosPlan += '<option value="' + item.pos_id + '_' + item.pos_name + '">' + item.pos_name + '</option>';	
					});
					midPosPlan += '</select>';
					$("div[id=modifi_affiliated_pos]").append(midPosPlan);
				}
			});
		}
	},
	
	//错误提示函数
	showMessage : function(msg, color)
	{
		var errorMsg = $("div[id=errorMsg]");
			errorMsg.html(msg);
			errorMsg.css("color", color);
			errorMsg.css("font-size", 20);
	}
}

