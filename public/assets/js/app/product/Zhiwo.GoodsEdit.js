if (!window.Zhiwo) {
	window.Zhiwo = new Object();
};
Zhiwo.GoodsEdit = {
    tmpElem: new Object(),
	init: function(){
		//初始化修改选项卡
		Zhiwo.GoodsEdit.changeTab();
		//初始化类型联动扩展属性
		$('#type_id').change(function() {
			var type = $(this).val();
			Zhiwo.GoodsEdit.setSpcByType(type);
		});
		var num = $("input[name='efficacy[]']:checked").length;
		if (num > 3) {
			$("input[name='efficacy[]']").not(':checked').attr('disabled', true);
		}
		$("input[name='efficacy[]']").change(function(){
			var num = $("input[name='efficacy[]']:checked").length;
			if (num > 3) {
				$("input[name='efficacy[]']").not(':checked').attr('disabled', true);
			} else {
				$("input[name='efficacy[]']").attr('disabled', false);
			}
		});
		$('#taskEditForm').submit(function(){
			var goodsName = $("input[name='name']").val();
			var groupTitle = $("textarea[name='group_title']").val();
			var salesChannel = $("input[name='sales_channel']").val();
			var brand_id = $("select[name='brand_id']").val();
			if (goodsName == '') {
				alert('忘记填写商品名称了');
				return false;
			}
			if (groupTitle == '' && (salesChannel == 2 || salesChannel == 3)) {
				alert('忘记填写团购标题了');
				return false;
			}
			if (brand_id == 0) {
				alert('请选择品牌');
				return false;
			}
		});
	},
	changeTab: function(){
		$("#tab_panel li").click(function(){
            if (0 && $(this).attr('nid') =="group") {
                Zhiwo.GoodsEdit.tmpElem = this;
                var dialog = KindEditor.dialog({
                    width : 350,
                    title : '提醒',
                    body : '<div id="selectGoodsForm"><center><br><br>切换将导致新修改信息丢失，确定吗?<br><br></center></div>',
                    closeBtn : {
                        name : '关闭',
                        click : function(e) {
                            dialog.remove();
                        }
                    },yesBtn : {
                        name : '确定',
                        click : function(e) {
                            $("#currtab").val('group');
                            $("#tab_panel li[id^=tb_bt_]").attr("class","normaltab");
                            $(Zhiwo.GoodsEdit.tmpElem).attr("class","hovertab");
                            var mid = $(Zhiwo.GoodsEdit.tmpElem).attr('nid');
                            $("div[id^=tb_info_]").attr("class","undis");
                            $("#tb_info_" + mid).attr("class","dis");
                            dialog.remove();
                        }
                    },noBtn : {
                        name : '取消',
                        click : function(e) {
                            dialog.remove();
                        }
                    }
                });
            } else {
                $("#tab_panel li[id^=tb_bt_]").attr("class","normaltab");
                $(this).attr("class","hovertab");
                var mid = $(this).attr('nid');
                $("div[id^=tb_info_]").attr("class","undis");
                $("#tb_info_" + mid).attr("class","dis");
            }
		});
	},
	setSpcByType: function(typeid){
		var type_id = $('#type_id').data('type_id');
		if (type_id != 0) {
			if(confirm('修改类型会丢失已有的商品参数，确定修改么？') != true) {
				$('#type_id').val(type_id);
				return false;
			}
		} else {
			$('#type_id option[value=0]').remove();
		}
		$('#type_id').data('type_id', typeid);
		$.get('/product/goods/ajax/getextattr?typeid='+typeid, function(resp){
			$('#htm_spec_rows').html('');
			for(var i in resp) {
				if (resp[i] == '温馨提示') {
					var inputVal = '由于部分商品包装更换较为频繁，因此您收到的货品有可能与图片不完全一致，请您以收到的商品实物为准，同时我们会尽量做到及时更新，由此给您带来不便多多谅解，谢谢！';
				} else {
					var inputVal = '';
				}
				var tr = '<tr><td width="10%" align="right"><b>'+resp[i]+'</b></td><td align="left"><input type="text" style="width:325px;" size="150" name="ext['+resp[i]+']" value="'+inputVal+'"></td></tr>';
				$('#htm_spec_rows').append(tr);
			}
		});
	}
}