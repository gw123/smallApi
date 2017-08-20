if(!window.Zhiwo)
{
	window.Zhiwo = new Object();
}
if(typeof runAction == "undefined" || typeof runAction == "null")
{
    window.runAction = false;
}

Zhiwo.ActivityGoods = {
	batchEditGoodsId : [],
	init : function()
    {
		Zhiwo.ActivityGoods.id = $("#channelId").val();
        if(runAction == "projectbrowse")
        {
            $("a[name=selectGoods]").css({color:"#CCCCCC"});
            $("a[name=selectGoods]").bind("click", function(){return false});
            $("a[name=add]").css({color:"#1F3A87"});
            $("a[name=add]").attr("href","/marketing/selectgoods?action=addColumn&project=activityGoods");
        }
        else if(runAction == "selectgoods")
        {
            Zhiwo.ActivityGoods.initChoosedGoods();
        }
		$("#batchChecked").bind("click", Zhiwo.ActivityGoods.allChecked);
		$("#adverseCheck").bind("click", Zhiwo.ActivityGoods.adverseCheck);
		$("#batchEdit").bind("click", Zhiwo.ActivityGoods.batchEdit);
		$("#batchDeleteGoods").bind("click", Zhiwo.ActivityGoods.batchDeleteGoods);
    },

    /**
     * 初始化选品
     */
    initChoosedGoods : function()
    {
        if(runAction == 'selectgoods')
        {
            var tr = '<tr bgcolor="#7A97E0"><td width="60">商品ID</td><td width="200">商品名</td>';
                    tr += '<td width="90">渠道价</td><td width="270">有效期</td><td width="150">排序值</td>\
                          <td>包邮</td></tr>';
            $("#choosedGoods").append(tr);
        }
    },
    
    /**
     * 选品
     */
    chooseGoods : function(obj)
    {
        var goodsId = $(obj).find('td').first().text();
        var goodsImage = $(obj).find('td').first().attr("name");
        var goodsName = $(obj).find('td').eq(1).html();
        var _goodsName = $(obj).find('td').eq(1).attr("name");
        var brandId = $(obj).find('td').eq(1).attr("title");
        var mallPrice = $(obj).find('td').eq(5).text();


        var tr = '<tr><td>' + goodsId + '</td><td>' + goodsName + '</td>';
                tr += '<td><input type="text" size="5" name="channelPrice" /></td>\
                        <td><input type="text" size="15" name="startTime" readOnly/>至\
                        <input type="text" size="15" name="endTime" readOnly/></td>\
                        <td><input type="text" size="4" name="displayOrder" value="0"/></td>\
                        <td><input type="text" size="4" name="freeShipping" value="0"/>\
                        <input type="hidden" name="goodsName" value="' + _goodsName + '"/>\
                        <input type="hidden" name="goodsImg" value="' + goodsImage + '" />\
                        <input type="hidden" name="brandId" value="' + brandId + '" />\
                        <input type="hidden" name="mallPrice" value="' + mallPrice + '" /></td>';
		tr += '</tr>';
        $("#choosedGoods").append(tr);
        return goodsId;
    },
	
	/*-----------------全选批量操作----------------------------------------*/
	allChecked : function()
	{
	    $(":checkbox[name!=adverseCheck]").attr("checked", true);
	    $(":checkbox[name!=adverseCheck]").parent().parent().attr("bgcolor", "#E5E5E5");
	},

	//反选
	adverseCheck : function()
	{
		$("table :checkbox").each(function(){
			if($(this).attr("checked"))
			{
				$(this).attr("checked", false);
                $(this).parent().parent().attr("bgcolor", "#FFFFFF");

			}
			else
			{
				$(this).attr("checked", true);
                $(this).parent().parent().attr("bgcolor", "#E5E5E5");
			}
		});
	},
	
		//批量编辑
	batchEdit : function()
	{
		var checked = $("tr[name!=batch] :checkbox[checked=true]");
		if(checked.length == 0)
		{
			alert("请选择商品！");
			return false;
		}
		
		var channelId = Zhiwo.ActivityGoods.id;
		var goodsName = [];
		Zhiwo.ActivityGoods.batchEditGoodsId = [];
		checked.each(function(){
			goodsName.push($(this).parent().siblings("td[name='goods_name']").text());
			Zhiwo.ActivityGoods.batchEditGoodsId.push($(this).attr("name"));
		});

		var editBody = '<table align="center" style="margin-top:10px;"><tr bgcolor="#C1C1C1">' + 
					   '<td><b>商品ID</b></td><td><b>商品名</b></td></tr>';
		for (var i = 0; i < checked.length; i++)
		{
			editBody += '<tr name="batch_tr" title="' + i + '"><td style="width:150;color:#ff702c;">' + Zhiwo.ActivityGoods.batchEditGoodsId[i] + '</td>' + 
						'<td style="width:300;color:blue;">' + goodsName[i] + '</td></tr>';
		}
		editBody += '<tr><td align="right">开始时间</td><td><input type="text" name="startTime" /></td></tr>'+
			        '<tr><td align="right">结束时间</td><td><input type="text" name="endTime" /></td></tr>' + 
					'<tr><td align="right">包邮</td><td><input type="text" name="freeShipping" /></td></tr>' + 
					'<tr><td colspan="2" align="center">一共选择了' + checked.length + '个商品</td></tr></table>';

		var dialog = KindEditor.dialog({
							width : 500,
							title : '批量编辑',
							body  : '<div id="batch_edit" name="cj"><span id="errorMsg"></span>' + editBody +'</div>',
							closeBtn : {
									name:"关闭",
									click : function(e)
									{
										$("tr :checkbox").attr("checked", false);
										Zhiwo.ActivityGoods.batchEditGoodsId = [];
										dialog.remove();
									}
							},
							noBtn : {
									name : "返回", 
									click : function(e)
									{
										$("tr :checkbox").attr("checked", false);
										Zhiwo.ActivityGoods.batchEditGoodsId = [];
										dialog.remove();
									}
							}, 
							yesBtn : {
									name : "确定", 
									click: function(e)
									{
										var url = '/marketing/selectgoods?random=' + Math.random();
										var startTime = $("#batch_edit input[name=startTime]").val();
										var endTime = $("#batch_edit input[name=endTime]").val();
										var freeShipping = $("#batch_edit input[name=freeShipping]").val();
										if(isNaN(freeShipping) && freeShipping != "")
										{
											alert("请输入正确的包邮数量");
											return false;
										}

										if(freeShipping == "" && startTime == "" && endTime == "")
										{
											alert("都为空你编辑什么东东呢？");
											return false;
										}

										if(startTime == "" && endTime != "" || endTime == "" && startTime != "")
										{
											alert("亲，开始时间和结束时间是一对好基友，不能分开的！");
											return false;
										}	

										if(confirm("确认编辑？"))
										{
											$(".ke-dialog span[title=确定]").hide();
											var params = {
												goodsId : Zhiwo.ActivityGoods.batchEditGoodsId, 
												channelId :channelId,
												startTime : startTime,
												endTime : endTime,
												freeShipping : freeShipping,
												action : 'batchedit',
												project:'activityGoods'
											};
											$.post(url, params, function(res){
												if(res == '1')
												{
													Zhiwo.ActivityGoods.batchEditGoodsId = [];
													location.reload();
												}
												else
												{
													if(res == '-1')
													{
														alert("活动id无效");
													}
													else if(res == '-2')
													{

														alert("商品id无效");
													}
													else if(res == '-3')
													{
														alert("起始日期不能小于今天");
													}
													else if(res == '-4')
													{
														alert("结束日期必须大于起始日期");
													}
													else if(res == '-5')
													{
														alert("其中有商品与其它活动商品冲突");
													}
													else
													{
														alert("世界末日了，你还编辑啥，赶紧回去吧，亲~~");
													}

													$(".ke-dialog span[title=确定]").show();
												}
											});
										}
									}
							}
		});

		$("#batch_edit input[name=startTime]").calendar();
		$("#batch_edit input[name=endTime]").calendar();
		$("#calendar_div").css("z-index", 811215);
		$("#batch_edit tr[name='batch_tr']").hover(
			function(){
				$(this).css("background-color", "#ADFF2F");
				$(this).children().css("color", "black");
				$(this).children().last().append("<div style='color:red;float:right;display:inline;' onclick='Zhiwo.Channel.delEditGoods(" + $(this).attr("title") +")' id='delete'>X&nbsp;</div>");
			},
			function()
			{
				$(this).css("background-color", "#FFFFFF");
				$(this).find("#delete").remove();
			}
		);
	},
	/*-----------------批量删除渠道商品--------------------------------*/
	batchDeleteGoods : function()
	{
		var checked = $("tr[name!=batch] :checkbox[checked=true]");
		if(checked.length == 0)
		{
			alert("请选择商品！");
			return false;
		}
		var goodsId = [];
		checked.each(function(){
			goodsId.push($(this).attr("name"));
		});
		if(confirm("你确认删除商品ID是：" + goodsId + "的商品吗？"))
		{
			var data = {goodsId:goodsId, channelId:Zhiwo.ActivityGoods.id,action:'deletechannelgoods',project:'activityGoods'};
			var url = '/marketing/selectgoods?ajax=1&random=' + Math.random();
			$.post(url, data, function(json){
				if(json == 1)
				{
					alert("删除成功！");
					location.reload();
				}
				else
				{
					alert("删除失败！")
				}
			});
		}
	}, 
}
