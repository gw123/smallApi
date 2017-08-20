if(!window.Zhiwo)
{
	window.Zhiwo = new Object();
}

if(typeof runAction == "undefined" || typeof runAction == "null")
{
    window.runAction = false;
}

Zhiwo.Channel = {
	id : 0,
	_subCat : 0,
	batchEditGoodsId : [],
	init : function()
	{
		$("input[name=start_time]").calendar();
		$("input[name=end_time]").calendar();
		$("input[id=addOne]").bind("click", Zhiwo.Channel.addOneGoods);
		Zhiwo.Channel.id = $("#channelId").val();
		$("#batchChecked").bind("click", Zhiwo.Channel.allChecked);
		$("#adverseCheck").bind("click", Zhiwo.Channel.adverseCheck);
		$("#batchDeleteGoods").bind("click", Zhiwo.Channel.batchDeleteGoods);
		$("#batchCreateUrl").bind("click", Zhiwo.Channel.batchCreateUrl);
		$("#batchEdit").bind("click", Zhiwo.Channel.batchEdit);
		$("#exportAll").bind("click", Zhiwo.Channel.exportAll);
		$("a[id=createOneUrl]").bind("click", Zhiwo.Channel.createOneUrl);
		$("a[id=editChannelGoods]").bind("click", Zhiwo.Channel.editChannelGoods);
		$("#topCat").bind("change", Zhiwo.Channel.subCat);
		$("#batchSelectGoods").bind("click", Zhiwo.Channel.batchSelectGoods);
		$("#allBatchSubmit").bind("click", Zhiwo.Channel.allBatchSubmit);
		$("#downloadQrcode").bind("click", Zhiwo.Channel.downloadQrcode);
		$("#batchPromoteTip").bind("click", Zhiwo.Channel.batchPromoteTip);
		$("a[id=editChannelTopQrcode]").bind("click", Zhiwo.Channel.editChannelTopQrcode);
        if(runAction == "projectbrowse")
        {
            $("a[name=selectGoods]").css({color:"#CCCCCC"});
            $("a[name=selectGoods]").bind("click", function(){return false});
            $("a[name=add]").css({color:"#1F3A87"});
            $("a[name=add]").attr("href","/marketing/channel/add");
        }
        else if(runAction == "selectgoods")
        {
            Zhiwo.Channel.initChoosedGoods();
        }
    },

	/*添加一个商品到渠道选品表*/
	addOneGoods : function()
	{
		var goodsId = $(this).attr("name");
		var channelPrice = $(this).parent().parent().find('#channelPrice').val();
		var channelId = Zhiwo.Channel.id;
		var goodsName = $(this).parent().siblings("#goodsName").text();
		var brandId = $(this).parent().siblings("#brandId").attr("title");
		var marketPrice = $(this).parent().siblings("#marketPrice").text();
		var price = $(this).parent().siblings("#price").text();
		var startTime = $(this).parent().parent().find('input[name=start_time]').val();
		var endTime = $(this).parent().parent().find('input[name=end_time]').val();
		var freeShipping = $(this).parent().parent().find('input[name=freeShipping]').val();
		var quantity = $(this).parent().parent().find('input[name=quantity]').val();
		var nightsMinBuy = $(this).parent().parent().find('input[name=nightsMinBuy]').val();
		var nightsMaxBuy = $(this).parent().parent().find('input[name=nightsMaxBuy]').val();
		var displayOrder = $(this).parent().parent().find('input[name=displayOrder]').val();

		if(channelId == "" || channelPrice == "")
		{
			alert("请填写数据！");
			return false;
		}
		data = {
                channelId:channelId, goodsId:goodsId, channelPrice:channelPrice,
                goodsName:goodsName, brandId:brandId, marketPrice:marketPrice,
                price:price, startTime:startTime, endTime:endTime,
                freeShipping:freeShipping, quantity:quantity,nightsMinBuy:nightsMinBuy,
                nightsMaxBuy:nightsMaxBuy,displayOrder:displayOrder
        };
		var url = "/marketing/channel/addonegoods?random=" + Math.random();
		$.post(url, data, function(json){
			if(json.status == 'succ')
			{
				alert("添加成功");
			}
			else
			{
				alert(json.msg);
			}
		});

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
			var data = {goodsId:goodsId, channelId:Zhiwo.Channel.id};
			var url = '/marketing/channel/deletechannelgoods?ajax=1&random=' + Math.random();
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
	//批量编辑
	batchEdit : function()
	{
		var checked = $("tr[name!=batch] :checkbox[checked=true]");
		if(checked.length == 0)
		{
			alert("请选择商品！");
			return false;
		}

		var channelId = Zhiwo.Channel.id;
		var goodsName = [];
		Zhiwo.Channel.batchEditGoodsId = [];
		checked.each(function(){
			goodsName.push($(this).parent().siblings("td[name='goods_name']").text());
			Zhiwo.Channel.batchEditGoodsId.push($(this).attr("name"));
		});

		var editBody = '<table align="center" style="margin-top:10px;"><tr bgcolor="#C1C1C1">' +
					   '<td><b>商品ID</b></td><td><b>商品名</b></td></tr>';
		for (var i = 0; i < checked.length; i++)
		{
			editBody += '<tr name="batch_tr" title="' + i + '"><td style="width:150;color:#ff702c;">' + Zhiwo.Channel.batchEditGoodsId[i] + '</td>' +
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
										Zhiwo.Channel.batchEditGoodsId = [];
										dialog.remove();
									}
							},
							noBtn : {
									name : "返回",
									click : function(e)
									{
										$("tr :checkbox").attr("checked", false);
										Zhiwo.Channel.batchEditGoodsId = [];
										dialog.remove();
									}
							},
							yesBtn : {
									name : "确定",
									click: function(e)
									{
										var url = '/marketing/channel/batchedit?random' + Math.random();
										var startTime = $("#batch_edit input[name=startTime]").val();
										var endTime = $("#batch_edit input[name=endTime]").val();
										var freeShipping = $("#batch_edit input[name=freeShipping]").val();
										if(isNaN(freeShipping) && freeShipping !== "")
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
												goodsId : Zhiwo.Channel.batchEditGoodsId,
												channelId :channelId,
												startTime : startTime,
												endTime : endTime,
												freeShipping : freeShipping
											};
											$.post(url, params, function(res){
												if(res == '1')
												{
													Zhiwo.Channel.batchEditGoodsId = [];
													location.reload();
												}
												else
												{
													if(res == '-1')
													{
														alert("渠道id无效");
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
														alert("结束日期必须大于起始日期")
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
		$("#batch_edit input[name=endTime]").calendar(
			{
                fieldSettings:function(input){
                	if($(input).attr("name") == 'endTime')
                	{
                		popUpCal.selectedHour = 23;
                    	popUpCal.selectedMinute = 58;
                	}
                	else
                	{
                		popUpCal.selectedHour = 0;
                    	popUpCal.selectedMinute = 0;
                	}

                }
            }
		);
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
	//删除一个批量编辑
	delEditGoods : function(index)
	{
		$("#batch_edit tr[title=" + index + "]").remove();
		Zhiwo.Channel.batchEditGoodsId.splice(index, 1);
	},
	//批量生产链接
	batchCreateUrl : function()
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
		var channelKey = $("input[name=channelKey]").val();
		var dialog = KindEditor.dialog({
			width : 500,
			title : "生产链接",
			body : '<div id="add_createUrl" style="margin:30px;width:470px;"><table width="100%"><tr bgcolor="#7A97E0" style="text-align:center;"><td>商品ID</td><td>生产链接</td></tr></table></div>',
			closeBtn : {
					name:"关闭",
					click : function(e)
					{
						$("tr :checkbox").attr("checked", false);
						dialog.remove();
					}
			},
			yesBtn : {
					name : "返回",
					click : function(e)
					{
						$("tr :checkbox").attr("checked", false);
						dialog.remove();
					}
			}
		});
		for(var i=0; i < goodsId.length; i ++)
		{
			var newUrl = "http://www.zhiwo.com/product/" + goodsId[i] + "/channel/" + channelKey;
			var row = '<tr style="height:25px;"><td>' + goodsId[i] + "</td><td>" + newUrl + "</td></tr>";
			$("#add_createUrl table").append(row);
			Zhiwo.Channel.addDialogHeight(25);
		}
	},
	createOneUrl : function()
	{
		$(this).parent().parent().find(":checkbox").attr('checked', true);
		$("#batchCreateUrl").trigger("click");
	},
	addDialogHeight : function(add)
	{
		var body = $(".ke-dialog");
		height = parseInt(body.css("height"));
		bodyHeight = parseInt($(".ke-dialog-body").css("height"));
		$(".ke-dialog").css("height", height+add);
		$(".ke-dialog-body").css("height", bodyHeight+add);
	},
	/*---------------导出全部----------------------------*/
	exportAll : function()
	{
		var href = location.href + '&export=1';
		location.href = href;
	},

	//编辑渠道商品
	editChannelGoods : function()
	{
		var goodsId = $(this).parent().siblings("td[name=goods_id]").text();
		var goodsName = $(this).parent().siblings('td[name=goods_name]').text();
		var marketPrice = $(this).parent().siblings("td[name=market_price]").text();
		var mallPrice = $(this).parent().siblings("td[name=mall_price]").text();
		var costPrice = $(this).parent().siblings("td[name=cost_price]").text();
		var channelPrice = $(this).parent().siblings("td[name=channel_price]").text();
		var rate =  $(this).parent().siblings("td[name=channel_price]").attr("data-rate");
		var taxRate = $(this).parent().siblings("td[name=taxRate]").text();
		var startTime = $(this).parent().siblings("td[name=start_time]").text();
		var endTime = $(this).parent().siblings("td[name=end_time]").text();
		var freeShipping = $(this).parent().siblings("td[name=free_shipping]").text();
        var quantity = $(this).parent().siblings("td[name=quantity]").text();
        var limitbuy = $(this).parent().siblings("td[name=minbuy]").text();
        var limitBuy = limitbuy.split('-');
        var displayorder = $(this).parent().siblings("td[name=displayOrder]").text();

		var content = '<table class="noborder" width="100%"><tr><td colspan="2"><center><span id="errorMsg">' +
				  '</span></center></td></tr><tr><th width="25%">商品ID：</th><td width="75%">' + goodsId +
				  '</td></tr><tr><th>商品名：</th><td><input type="text" name="goodsName" value="' + goodsName + '"></td></tr>' +
				  '<tr><th>市场价：</th><td><input type="text" name="marketPrice" value="' + marketPrice + '"></td></tr>' +
				  '<tr><th>商城价：</th><td><input type="text" name="mallPrice" value="' + mallPrice + '"></td></tr>' +
				  '<tr><th>成本价：</th><td>' + costPrice + '</td></tr>' +
				  '<tr><th>渠道价：</th><td><input type="text" name="channelPrice" value="' + channelPrice + '" class="channel-price-change" data-rate="'+ rate+'" data-goods-id="'+goodsId+'"/></td></tr>' +
		          '<tr><th>税费：</th><td><input type="text" name="taxRate" id="tax-rate-'+goodsId+ '" value="' + taxRate + '"  readOnly/></td></tr>' +
				  '<tr><th>起始时间：</th><td><input type="text" name="startTime" value="' + startTime+ '"></td></tr>' +
				  '<tr><th>结束时间：</th><td><input type="text" name="endTime" value="' + endTime+ '"></td></tr>' +
				  '<tr><th>包邮：</th><td><input type="text" name="freeShipping" value="' + freeShipping+ '"></td></tr>';

        var rise = 0;
        if(CHANNEL_KEY == 'nights_seckill' || CHANNEL_KEY == 'nights_lowprice' || CHANNEL_KEY == 'wechatseckill' || (CHANNEL_KEY.indexOf('wechatseckillother') !== -1))
        {
            content +='<tr><th>加入数量</th><td><input type="text" name="init_stock" value="' + quantity + '"/></td></tr>' +
                      '<tr><th>限购</th><td><input type="text" name="minbuy" value="' + limitBuy[0] + '" size="3"/>-' +
                      '<input type="text" name="maxbuy" value="' + limitBuy[1] + '" size="3"/></td></tr>';
            rise = 70;
        }
        if(CHANNEL_KEY == 'edm')
        {
			var spe_pic = $(this).parent().siblings("td[name=spe_pic]").attr('data');
			var is_top  = $(this).parent().siblings("td[name=is_top]").attr('data');
			var inc_init=$(this).parent().siblings("td[name=inc_init]").attr('data');
			var inc_rate=$(this).parent().siblings("td[name=inc_rate]").attr('data');
			var max_buyers_num=$(this).parent().siblings("td[name=max_buyers_num]").attr('data');
			content += '<tr><th>定制图片:</th><td><input class="extAttr" type="text" name="spe_pic" value="' + spe_pic + '"/></td></tr>';
			content += '<tr><th>是否主推:</th><td><select class="extAttr"  name="is_top">';
			if(is_top == 1){
				content += '<option value="1" selected>是</option><option value="0" >否</option></select></td></tr>';
			}else{
				content += '<option value="0" selected>否</option><option value="1" >是</option></select></td></tr>';
			}
			content += '<tr><th>购买人数初始值:</th><td><input class="extAttr" type="text" name="inc_init" value="' + inc_init + '"/></td></tr>';
			content += '<tr><th>每十分钟增加几个:</th><td><input class="extAttr" type="text" name="inc_rate" value="' + inc_rate + '"/></td></tr>';
			content += '<tr><th>最大购买人数:</th><td><input class="extAttr" type="text" name="max_buyers_num" value="' + max_buyers_num + '"/></td></tr>';

            rise = 140;
		}
		   content += '<tr><th>排序: </th><td><input type="text" name="displayOrder" value="' +
                      displayorder + '" size="3"/></td></tr></table>';
		var dialog = KindEditor.dialog({
			title : '编辑渠道商品',
			width : 500,
			body  : '<div id="editGoods" style="margin:10px;width:480px;overflow: auto">' + content + '</div>',
			closeBtn : {
				name : '关闭',
				click: function(e){
					dialog.remove();
					location.reload();
				}
			},
			yesBtn : {
				name : '修改',
				click: function(e){
					Zhiwo.Channel.checkEdit(goodsId);
				}
			},
			noBtn : {
				name : '返回',
				click: function(e){
					dialog.remove();
					location.reload();
				}
			}
		});

		$("#editGoods input[name=startTime]").calendar();
		$("#editGoods input[name=endTime]").calendar();
		$("#calendar_div").css("z-index", 811215);
		$(".channel-price-change").bind('change',function(){
			var channelPrice = $(this).val();
			var rate = $(this).attr('data-rate');
			var goodsId = $(this).attr("data-goods-id");
			if (rate != '0')
			{
				$("#tax-rate-" + goodsId).val(Math.round(channelPrice * rate)/100);
			}
		});

	},
	/*---------------------验证编辑渠道商品, 成功则提交修改----------------------------------*/
	checkEdit : function(goodsId)
	{
		Zhiwo.Channel.showMsg("", "");
		$(".ke-dialog span[title=修改]").hide();
        var goodsName = $("#editGoods input[name=goodsName]").val();
        var marketPrice = parseFloat($("#editGoods input[name=marketPrice]").val());
        var mallPrice = parseFloat($("#editGoods input[name=mallPrice]").val());
		var channelPrice = parseFloat($("#editGoods input[name=channelPrice]").val());
		var startTime = $("#editGoods input[name=startTime]").val();
		var endTime = $("#editGoods input[name=endTime]").val();
		var freeShipping = parseInt($("#editGoods input[name=freeShipping]").val());
        var quantity = $("#editGoods input[name=init_stock]").val();
        var minbuy = $("#editGoods input[name=minbuy]").val();
        var maxbuy = $("#editGoods input[name=maxbuy]").val();
        var displayOrder = $("#editGoods input[name=displayOrder]").val();
		var taxRate = parseFloat($("#editGoods input[name=taxRate]").val());
        if(goodsName == "")
        {
            Zhiwo.Channel.showMsg("请输入正确的商品名称", "red");
            $(".ke-dialog span[title=修改]").show();
            return false;
        }
        if(marketPrice == "" || isNaN(marketPrice))
        {
    		Zhiwo.Channel.showMsg("请输入正确的市场价格", "red");
            $(".ke-dialog span[title=修改]").show();
            return false;
        }
        if(mallPrice == "" || isNaN(mallPrice))
        {
            Zhiwo.Channel.showMsg("请输入正确的商城价格", "red");
            $(".ke-dialog span[title=修改]").show();
            return false;
        }
		if(channelPrice == "" || isNaN(channelPrice))
		{
			Zhiwo.Channel.showMsg("请输入正确的渠道价格", "red");
			$(".ke-dialog span[title=修改]").show();
			return false;
		}

		if(freeShipping === "" || isNaN(freeShipping))
		{
			Zhiwo.Channel.showMsg("请输入正确的包邮数量", "red");
			$(".ke-dialog span[title=修改]").show();
			return false;
		}

		Zhiwo.Channel.showMsg("正在提交处理中，请稍后...", "blue");
		var extAttribute = {};
		$('.extAttr').each(function(){
			var name = this.name;
			var value= $(this).val();
			extAttribute[name] = value;
		});
		var data = {
            goodsName:goodsName,marketPrice:marketPrice,mallPrice:mallPrice,
            channelPrice: channelPrice, startTime: startTime, endTime:endTime,
            freeShipping:freeShipping, channelId:Zhiwo.Channel.id, goodsId:goodsId,
            quantity:quantity,minbuy:minbuy,maxbuy:maxbuy,displayOrder:displayOrder,
            extAttribute:extAttribute,taxRate:taxRate
        };
		var url = "/marketing/channel/editchannelgoods?random=" + Math.random();
		$.post(url, data, function(json){
			if(json.status == 'succ')
			{
				Zhiwo.Channel.showMsg(json.msg, "blue");
			}
			else
			{
				Zhiwo.Channel.showMsg(json.msg, "red");
				$(".ke-dialog span[title=修改]").show();
			}
		});
	},
	showMsg : function(msg, color)
	{
		$("#errorMsg").html(msg);
		$("#errorMsg").css("color", color);
		$("#errorMsg").css("font-size", 20);
	},

	/*-------------------------生成子分类-------------------*/
	subCat : function()
	{
		$("#topCat").next("select[name=subCat]").remove();
		var topCat = $(this).val();
		if(topCat == -1)
		{
			return false;
		}

		var url = "/marketing/channel/selection?random" + Math.random();
		var data = {childCatInfo:1, subCat:topCat};
		$.post(url, data, function(json){
			var newSelect = '<select name="subCat">';
			if(json == null)
			{
				return false;
			}

			for(var i = 0; i < json.length; i++ )
			{
				newSelect += '<option value="' + json[i].cat_id + '"';
				if(json[i].cat_id == Zhiwo.Channel._subCat)
				{
					newSelect += 'selected="selected"';
				}
				newSelect += '>' + json[i].cat_name + '</option>';
			}
			newSelect += '</select>';
			$("#topCat").after(newSelect);
		});
	},
	/*-----------------------批量渠道选品----------------------*/
	batchSelectGoods: function()
	{
		var checked = $("div[name=data] table :checkbox[checked=true]");
		if(checked.length < 1)
		{
			alert("请选择商品！");
			return false;
		}

		var startTime = $.trim($("#batchDiv input[name=start_time]").val());
		var endTime = $.trim($("#batchDiv input[name=end_time]").val());
		var discount = $.trim($("#batchDiv input[name=discount]").val());
		var freeShipping = $.trim($("#batchDiv input[name=freeShipping]").val());
        var minBuy = $.trim($("#batchDiv input[name=minBuy]").val());
        var maxBuy = $.trim($("#batchDiv input[name=maxBuy]").val());
        var quantity = $.trim($("#batchDiv input[name=quantity]").val());
		var displayOrder = $.trim($("#batchDiv input[name=displayOrder]").val());

		if(startTime == "" && endTime == "" && discount == "" && freeShipping == ""
            && isNaN(parseInt(minBuy)) && isNaN(parseInt(maxBuy)) && isNaN(parseInt(quantity)) && isNaN(parseInt(displayOrder)))
		{
			alert("亲，至少得填一项才能批量操作~~");
			return false;
		}

		checked.each(function(){
			var price = parseFloat($(this).parent().siblings("#price").text());
			var channelPrice = price * discount;
			channelPrice = Math.round(channelPrice * 100)/100;
			$(this).parent().parent().find("#channelPrice").val(channelPrice);
			$(this).parent().parent().find("input[name=start_time]").val(startTime);
			$(this).parent().parent().find("input[name=end_time]").val(endTime);
			$(this).parent().parent().find("input[name=freeShipping]").val(freeShipping);
			$(this).parent().parent().find("input[name=nightsMinBuy]").val(minBuy);
			$(this).parent().parent().find("input[name=nightsMaxBuy]").val(maxBuy);
			$(this).parent().parent().find("input[name=nightsQuantity]").val(quantity);
			$(this).parent().parent().find("input[name=displayOrder]").val(displayOrder);
		});
	},
	/*-------------------提交批量操作-------------------------------------*/
	allBatchSubmit : function()
	{
        if(!confirm("确认提交选品？"))
        {
            return false;
        }

		var checked = $("div[name=data] table :checkbox[checked=true]");
		if(checked.length < 1)
		{
			alert("请选择商品！");
			return false;
		}
		var channelPrice = [];
		var startTime = [];
		var endTime = [];
		var freeShipping = [];
		var goodsName = [];
		var brandId = [];
		var goodsId = [];
		var marketPrice = [];
		var mallPrice = [];
        var quantity = [];
        var minbuy = [];
        var maxbuy = [];
        var displayOrder = [];
        var flag = true;
		checked.each(function(){
            if(flag)
            {
			    var price = $(this).parent().parent().find("#channelPrice").val();
			    var _startTime = $(this).parent().parent().find("input[name=start_time]").val();
			    var _endTime = $(this).parent().parent().find("input[name=end_time]").val();
			    var _freeShipping = $(this).parent().parent().find("input[name=freeShipping]").val();
			    var _goodsName = $(this).parent().siblings("#goodsName").text();
			    var _brandId = $(this).parent().siblings("#brandId").attr("title");
			    var _goodsId = $(this).parent().siblings("#goodsId").text();
			    var _marketPrice = $(this).parent().siblings("#marketPrice").text();
			    var _price = $(this).parent().siblings("#price").text();
                var _quantity = $(this).parent().parent().find("input[name=nightsQuantity]").val();
                var _minbuy = $(this).parent().parent().find("input[name=nightsMinBuy]").val();
                var _maxbuy = $(this).parent().parent().find("input[name=nightsMaxBuy]").val();
                var _displayOrder = $(this).parent().parent().find("input[name=displayOrder]").val();

			    if(price == "")
			    {
			    	alert("渠道价格必须填写");
			    	flag = false;
			    }

			    if(_freeShipping == "")
			    {
			    	alert("包邮数量必须填写");
			    	flag = false;
			    }
			    channelPrice.push(price);
			    startTime.push(_startTime);
			    endTime.push(_endTime);
			    freeShipping.push(_freeShipping);
			    goodsName.push(_goodsName);
			    brandId.push(_brandId);
			    goodsId.push(_goodsId);
			    marketPrice.push(_marketPrice);
			    mallPrice.push(_price);
                quantity.push(_quantity);
                minbuy.push(_minbuy);
                maxbuy.push(_maxbuy);
                displayOrder.push(_displayOrder);
            }
		});

        if(flag)
        {
			data = {
                channelId:Zhiwo.Channel.id, channelPrice:channelPrice,
                startTime:startTime, endTime:endTime, freeShipping:freeShipping,
                goodsName:goodsName, brandId:brandId, goodsId:goodsId,
                marketPrice:marketPrice, mallPrice:mallPrice,
                quantity:quantity,minbuy:minbuy,
                maxbuy:maxbuy,displayOrder:displayOrder
            };
			var url = "/marketing/channel/addonegoods?batch=1&random=" + Math.random();
			$.post(url, data, function(json){
				var len = json.length;
				var height = len * 25;
				var content = '<table style="width:460px;" align="center">';
				for(var i = 0; i < len; i++)
				{
					var style = "";
					if(json[i].status == 'fail')
					{
						style = ' style="color:red"';
					}
					content += '<tr' + style + '><td>' + json[i].status + '</td><td>' + json[i].msg + '</td></tr>';
				}
				content += '</table>';
				var dialog = KindEditor.dialog({
					title : '批量操作信息提示窗口',
					width : 500,
					height : 80 + height,
					body : '<div style="width:480px;margin:10px;">' + content + '</div>',
					closeBtn : {
						 name : '关闭',
						click : function(e)
						{
							dialog.remove();
						}
					},
					noBtn : {
						name : '返回',
						click: function(e)
						{
							dialog.remove();
						}
					}
				});
			});
        }
	},

    chooseGoods : function(obj)
    {
        var goodsId = $(obj).find('td').first().text();
        var goodsImage = $(obj).find('td').first().attr("name");
        var goodsName = $(obj).find('td').eq(1).html();
        var _goodsName = $(obj).find('td').eq(1).attr("name");
        var brandId = $(obj).find('td').eq(1).attr("title");
        var mallPrice = $(obj).find('td').eq(6).text();
		var tax_rate = $(obj).attr("data-tax-rate");//税率
		var goodsAttribute = $(obj).attr("data-goods-attribute");//商品属性
		var seaamoyPrice = $(obj).attr("data-seaamoy-price");//海淘价
        var groupPrice = $(obj).attr("data-group-price");//团购价
        var price = $(obj).attr("data-price");//商城价

        var tr = '<tr><td>' + goodsId + '</td><td>' + goodsName + '</td>';
                tr += '<td><input type="text" size="5" class="channelPrice-submit" name="channelPrice" data-tax-rate="'+ tax_rate+'" data-goods-id="'+goodsId+'"/></td>\
                		<td><input type="text" size="5" name="tax_rate" id="tax-rate-'+goodsId+'" readOnly/>\
                        <td><input type="text" size="12" name="startTime" readOnly/>至\
                        <input type="text" size="12" name="endTime" readOnly/></td>\
                        <td><input type="text" size="4" name="displayOrder" value="0"/></td>\
                        <td><input type="text" size="4" name="freeShipping" value="0"/>\
                        <input type="hidden" name="goodsName" value="' + _goodsName + '"/>\
                        <input type="hidden" name="rate" value="' + tax_rate + '"/>\
                        <input type="hidden" name="goodsImg" value="' + goodsImage + '" />\
                        <input type="hidden" name="brandId" value="' + brandId + '" />\
                        <input type="hidden" name="goodsAttribute" value="' + goodsAttribute + '" />\
                        <input type="hidden" name="seaamoyPrice" value="' + seaamoyPrice + '" />\
                        <input type="hidden" name="mallPrice" value="' + mallPrice + '" /></td>';
		tr += '</tr>';
        $("#choosedGoods").append(tr);
		//绑定事件
		$(".channelPrice-submit").bind('change', function () {
			var goods_id = $(this).attr("data-goods-id");
			var tax_rate = $(this).attr("data-tax-rate");
			var channel_price = $(this).val();
            if (channel_price > groupPrice && channel_price > seaamoyPrice && channel_price > price)
            {
                alert('渠道价高于售价');
            }
			if (tax_rate != '0')
			{
				var nnn = $('#tax-rate-' + goods_id).val(Math.round(tax_rate * channel_price) / 100);
			}
		});
        return goodsId;
    },
    //初始化选品界面
    initChoosedGoods : function()
    {
        if(runAction == 'selectgoods')
        {
            var tr = '<tr bgcolor="#7A97E0"><td width="60">商品ID</td><td width="200">商品名</td>';
                    tr += '<td width="90">渠道价</td><td width="90">税费</td><td width="270">有效期</td><td width="150">排序值</td>\
                          <td>包邮</td></tr>';
            $("#choosedGoods").append(tr);
        }
    },
    checkGoods : function()
    {
        return true;
    },
    downloadQrcode : function()
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

		if(confirm("你确认下载商品ID是：" + goodsId + "的二维码吗？"))
		{
			var url = "/marketing/selectgoods?project=channel&action=downloadqrcode&channelKey=" + CHANNEL_KEY + "&goodsId=" + goodsId;
			location.href = url;
		}
    },
    //编辑渠道主推图、二维码图片和微信图片URL
    editChannelTopQrcode : function()
	{
		var goodsId = $(this).parent().siblings("td[name=goods_id]").text();
		var goodsName = $(this).parent().siblings('td[name=goods_name]').text();
		var marketPrice = $(this).parent().siblings("td[name=market_price]").text();
		var mallPrice = $(this).parent().siblings("td[name=mall_price]").text();
		var channelPrice = $(this).parent().siblings("td[name=channel_price]").text();
		var startTime = $(this).parent().siblings("td[name=start_time]").text();
		var endTime = $(this).parent().siblings("td[name=end_time]").text();
		var isTop = $(this).parent().siblings("td[name=is_top]").text();
		var isExchange = $(this).parent().siblings("td[name=is_exchange]").text();
        var topUrl = $(this).parent().siblings("td[name=top_url]").find("a").attr("href");
        var topIndexUrl = $(this).parent().siblings("td[name=top_index_url]").find("a").attr("href");
        var wtopUrl = $(this).parent().siblings("td[name=wtop_url]").find("a").attr("href");
        var qrcodeUrl = $(this).parent().siblings("td[name=qrcode_url]").find("a").attr("href");
        var wechatImgUrl = $(this).parent().siblings("td[name=wechatimg_url]").find("a").attr("href");
        var pcGoodsUrl = $(this).parent().siblings("td[name=pc_goods_url]").find("a").attr("href");
        var shareLogoUrl = $(this).parent().siblings("td[name=share_logo_url]").find("a").attr("href");
		var atopUrl = $(this).parent().siblings("td[name=atopUrl]").find("a").attr("href");
        var aGoodsUrl = $(this).parent().siblings("td[name=aGoodsUrl]").find("a").attr("href");
        var lowestDiscount = $(this).parent().siblings("td[name=lowest_discount]").text();
        var trueStock = $(this).parent().siblings("td[name=true_stock]").text();
        var promoteTip = $(this).parent().siblings("td[name=promote_tip]").text();
        var flowerNum = $(this).parent().siblings("td[name=flower_num]").text();
        isTop = ($.trim(isTop) == "是") ? "y" : "n";
        isExchange = ($.trim(isExchange) == "是") ? "y" : "n";
        topUrl = $.trim(topUrl);
        topIndexUrl = $.trim(topIndexUrl);
        wtopUrl = $.trim(wtopUrl);
        qrcodeUrl = $.trim(qrcodeUrl);
        wechatImgUrl = $.trim(wechatImgUrl);
        pcGoodsUrl = $.trim(pcGoodsUrl);
        shareLogoUrl = $.trim(shareLogoUrl);
        lowestDiscount = $.trim(lowestDiscount);
        trueStock = parseInt($.trim(trueStock));
        promoteTip = $.trim(promoteTip);
        flowerNum = parseInt($.trim(flowerNum));
		atopUrl = $.trim(atopUrl);
		aGoodsUrl = $.trim(aGoodsUrl);

		var content = '<table class="noborder" width="100%"><tr><td colspan="2"><center><span id="errorMsg">' +
					  '</span></center></td></tr><tr><th width="25%">商品ID：</th><td width="75%">' + goodsId +
					  '</td></tr><tr><th>商品名：</th><td>' + goodsName + '</td></tr>' +
					  '<tr><th>市场价：</th><td>' + marketPrice + '</td></tr>' +
					  '<tr><th>商城价：</th><td>' + mallPrice + '</td></tr>' + 
					  '<tr><th>渠道价：</th><td>' + channelPrice + '</td></tr>' + 
					  '<tr><th>起始时间：</th><td>' + startTime + '</td></tr>' + 
					  '<tr><th>结束时间：</th><td>' + endTime + '</td></tr>' + 
					  '<tr><th>是否主推：</th><td><input type="radio" name="isTop" value="y" ' + (isTop == "y" ? "checked" : "") + '/>是<input type="radio" name="isTop" value="n" ' + (isTop == "n" ? "checked" : "") + '/>否</td></tr>' + 
					  '<tr><th>PC主推图URL：</th><td><input type="text" name="topUrl" value="' + topUrl + '" size="52"></td></tr>' + 
					  '<tr><th>PC主推图URL(首页)：</th><td><input type="text" name="topIndexUrl" value="' + topIndexUrl + '" size="52"></td></tr>' + 
					  '<tr><th>微信主推图URL：</th><td><input type="text" name="wtopUrl" value="' + wtopUrl + '" size="52"></td></tr>' + 
					  '<tr><th>二维码URL：</th><td><input type="text" name="qrcodeUrl" value="' + qrcodeUrl + '" size="52"></td></tr>' + 
					  '<tr><th>微信图URL：</th><td><input type="text" name="wechatImgUrl" value="' + wechatImgUrl + '" size="52"></td></tr>' + 
					  '<tr><th>PC商品图URL：</th><td><input type="text" name="pcGoodsUrl" value="' + pcGoodsUrl + '" size="52"></td></tr>' + 
					  '<tr><th>分享LogoURL：</th><td><input type="text" name="shareLogoUrl" value="' + shareLogoUrl + '" size="52"></td></tr>' +
					  '<tr><th>app主推图URL：</th><td><input type="text" name="atopUrl" value="' + atopUrl + '" size="52"></td></tr>' + 
					  '<tr><th>app商品图URL：</th><td><input type="text" name="aGoodsUrl" value="' + aGoodsUrl + '" size="52"></td></tr>' + 
					  '<tr><th>全网最低折：</th><td><input type="text" name="lowestDiscount" value="' + lowestDiscount + '"></td></tr>' + 
					  '<tr><th>修改库存：</th><td><input type="text" name="trueStock" value="' + trueStock + '"></td></tr>' + 
					  '<tr><th>促销语：</th><td><input type="text" name="promoteTip" value="' + promoteTip + '" size="52"></td></tr>' + 
					  '<tr><th>是否用花兑换：</th><td><input type="radio" name="isExchange" value="y" ' + (isExchange == "y" ? "checked" : "") + '/>是<input type="radio" name="isExchange" value="n" ' + (isExchange == "n" ? "checked" : "") + '/>否</td></tr>' + 
					  '<tr><th>兑换需要花数：</th><td><input type="text" name="flowerNum" value="' + flowerNum + '"></td></tr>';

		var dialog = KindEditor.dialog({
			title : '编辑渠道商品',
			width : 500,
			body  : '<div id="edit_channel_top_qrcode_form" style="margin:10px;width:480px;overflow: auto">' + content + '</div>',
			closeBtn : {
				name : '关闭',
				click: function(e){
					dialog.remove();
					location.reload();
				}
			},
			yesBtn : {
				name : '修改',
				click: function(e){
					Zhiwo.Channel.checkEditChannelTopQrcode(goodsId);
				}
			},
			noBtn : {
				name : '返回',
				click: function(e){
					dialog.remove();
					location.reload();
				}
			}
		});

		$("#calendar_div").css("z-index", 811215);
	},
	/*---------------------验证编辑渠道主推图、二维码图片和微信图片URL, 成功则提交修改----------------------------------*/
	checkEditChannelTopQrcode : function(goodsId)
	{
		var channelId = Zhiwo.Channel.id;
		Zhiwo.Channel.showMsg("", "");
		$(".ke-dialog span[title=修改]").hide();
		var isTop = $("#edit_channel_top_qrcode_form :radio[name=isTop]:checked").val();
		var isExchange = $("#edit_channel_top_qrcode_form :radio[name=isExchange]:checked").val();
		var topUrl = $("#edit_channel_top_qrcode_form input[name=topUrl]").val();
		var topIndexUrl = $("#edit_channel_top_qrcode_form input[name=topIndexUrl]").val();
		var wtopUrl = $("#edit_channel_top_qrcode_form input[name=wtopUrl]").val();
		var qrcodeUrl = $("#edit_channel_top_qrcode_form input[name=qrcodeUrl]").val();
		var wechatImgUrl = $("#edit_channel_top_qrcode_form input[name=wechatImgUrl]").val();
		var pcGoodsUrl = $("#edit_channel_top_qrcode_form input[name=pcGoodsUrl]").val();
		var atopUrl = $("#edit_channel_top_qrcode_form input[name=atopUrl]").val();
		var aGoodsUrl = $("#edit_channel_top_qrcode_form input[name=aGoodsUrl]").val();
		var shareLogoUrl = $("#edit_channel_top_qrcode_form input[name=shareLogoUrl]").val();
		var lowestDiscount = $("#edit_channel_top_qrcode_form input[name=lowestDiscount]").val();
		var trueStock = $("#edit_channel_top_qrcode_form input[name=trueStock]").val();
		var promoteTip = $("#edit_channel_top_qrcode_form input[name=promoteTip]").val();
		var flowerNum = $("#edit_channel_top_qrcode_form input[name=flowerNum]").val();

		Zhiwo.Channel.showMsg("正在提交处理中，请稍后...", "blue");

		var data = {
			is_top: isTop, top_url: topUrl, qrcode_url: qrcodeUrl, lowest_discount: lowestDiscount, wtop_url: wtopUrl, top_index_url: topIndexUrl, is_exchange: isExchange,
			wechatimg_url: wechatImgUrl, channelId: Zhiwo.Channel.id, goodsId: goodsId, pc_goods_url: pcGoodsUrl, share_logo_url: shareLogoUrl, true_stock: trueStock, promote_tip: promoteTip, flower_num: flowerNum, atopUrl: atopUrl, aGoodsUrl: aGoodsUrl
        };

		var url = "/marketing/channel/editchanneltopqrcode?random=" + Math.random();
		$.post(url, data, function(json){
			if(json.status == 'succ')
			{
				Zhiwo.Channel.showMsg(json.msg, "blue");
			}
			else
			{
				Zhiwo.Channel.showMsg(json.msg, "red");
				$(".ke-dialog span[title=修改]").show();
			}
		});
	},

	//批量编辑促销语
	batchPromoteTip : function()
	{
		var checked = $("tr[name!=batch] :checkbox[checked=true]");
		if(checked.length == 0)
		{
			alert("请选择商品！");
			return false;
		}

		var channelId = Zhiwo.Channel.id;
		var goodsName = [];

		Zhiwo.Channel.batchEditGoodsId = [];
		checked.each(function(){
			goodsName.push($(this).parent().siblings("td[name='goods_name']").text());
			Zhiwo.Channel.batchEditGoodsId.push($(this).attr("name"));
		});

		var editBody = '<table align="center" style="margin-top:10px;"><tr bgcolor="#C1C1C1">' +
					   '<td><b>商品ID</b></td><td><b>商品名</b></td></tr>';
		for (var i = 0; i < checked.length; i++)
		{
			editBody += '<tr name="batch_tr" title="' + i + '"><td style="width:150;color:#ff702c;">' + Zhiwo.Channel.batchEditGoodsId[i] + '</td>' +
						'<td style="width:300;color:blue;">' + goodsName[i] + '</td></tr>';
		}

		editBody += '<tr><td align="right">促销语</td><td><input type="text" name="promoteTip" /></td></tr>'+
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
					Zhiwo.Channel.batchEditGoodsId = [];
					dialog.remove();
				}
			},
			noBtn : {
				name : "返回",
				click : function(e)
				{
					$("tr :checkbox").attr("checked", false);
					Zhiwo.Channel.batchEditGoodsId = [];
					dialog.remove();
				}
			},
			yesBtn : {
				name : "确定",
				click: function(e)
				{
					var url = '/marketing/channel/batcheditptip?random' + Math.random();
					var promoteTip = $("#batch_edit input[name=promoteTip]").val();

					if(promoteTip == "")
					{
						// alert("请输入促销语？");
						// return false;
					}

					if(confirm("确认编辑？"))
					{
						$(".ke-dialog span[title=确定]").hide();
						var params = {
							goodsId : Zhiwo.Channel.batchEditGoodsId,
							channelId : channelId,
							promoteTip : promoteTip,
						};

						$.post(url, params, function(res){
							if(res == '1')
							{
								Zhiwo.Channel.batchEditGoodsId = [];
								location.reload();
							}
							else
							{
								$(".ke-dialog span[title=确定]").show();
							}
						});
					}
				}
			}
		});
	}
};


$(function(){
if(!runAction)
{
	Zhiwo.Channel.init();
}

});
