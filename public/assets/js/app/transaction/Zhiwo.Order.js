if (!window.Zhiwo) {
	window.Zhiwo = new Object();
};
Zhiwo.Order = {
	cuurtab: 'all',
	prerow: null,
	detailurl: '/transaction/order/ajax/view/',
	showRemark: 0,
	isLoading: false,
	init : function(){
		Zhiwo.Order.initTab();
		Zhiwo.Order.changeTab();
		Zhiwo.Order.initEasyBt();
		$("#to_time").calendar({dateFormat: 'YMD-',timeSeparators: [' ',':']});
		$("#from_time").calendar();
        $("#ship_from_time").calendar();
        $("#ship_to_time").calendar();
		$("#tab_panel li").each(function(){
			$(this).bind("click",function(){
				$(this).attr("class","hovertab");
				$("#tab_panel li[id!="+$(this).attr("id")+"]").each(function(){
					$(this).attr("class","normaltab");
				});
			});
		});
		$("a[id=view_detail]").each(function(){
			$(this).bind("click",function(){
				var currrow = $(this).attr("row");
				if (currrow != null && currrow != Zhiwo.Order.prerow){
					$("#detail_panel").remove();
					Zhiwo.Order.hideEasyBt();
					$(Zhiwo.Order.getOrderDetailHtml()).insertAfter("#row_"+currrow);
					var durl = Zhiwo.Order.detailurl + $(this).attr("name") + '?rand='+Math.random();
					$.getJSON(durl,function(data){
						if (data==''){
							alert('订单信息获取失败！请重试！');
							$("#detail_panel").remove();
						}else{
							Zhiwo.Order.initDetailPlan(data);
						}
					});
				}
				Zhiwo.Order.prerow = currrow;
			});
		});
		$("#cball").bind('click', function(){
			if (this.checked == true) {
				$("input[id^=cblist]").selected(1);
			} else {
				$("input[id^=cblist]").selected(0);
			}
		});
		//批量客审 
		$("#btnAllCE").bind('click', function(){
			$url = '/transaction/order/ajax/allcexamine';
			var orderIds = document.getElementsByName('cblist[]');
			if (orderIds == null) return false;
			var j = 0;
			var arr = new Array();
			for (var i = 0; i < orderIds.length; i++) {
				if (orderIds[i].checked) {
					arr[j] = orderIds[i].value;
					j++;
				}
			}
			if (arr.length == 0) {
				alert("请选择要客审的订单");
				return false;
			}
			$.post($url, {list:arr}, function(rs) {
				if (rs == 'SUCC') {
					alert('操作成功');
				} else {
					alert('操作失败');
				}
			});
		});
		//批量财审
		$("#btnAllFE").bind('click', function(){
			$url = '/transaction/order/ajax/allfexamine';
			var orderIds = document.getElementsByName('cblist[]');
			if (orderIds == null) return false;
			var j = 0;
			var arr = new Array();
			for (var i = 0; i < orderIds.length; i++) {
				if(orderIds[i].checked) {
					arr[j] = orderIds[i].value;
					j++;
				}
			}
			if (arr.length == 0) {
				alert("请选择要财审的订单");
				return false;
			}
			$.post($url, {list:arr}, function(rs) {
				if (rs == 'SUCC') {
					alert('操作成功');
				} else {
					alert('操作失败');
				}
			});
		});
		//批量反审核
		$("#btnAllReE").bind('click', function(){
			$url = '/transaction/order/ajax/allreexamine';
			var orderIds = document.getElementsByName('cblist[]');
			if (orderIds == null) return false;
			var j = 0;
			var arr = new Array();
			for (var i = 0; i < orderIds.length; i++) {
				if(orderIds[i].checked) {
					arr[j] = orderIds[i].value;
					j++;
				}
			}
			if (arr.length == 0) {
				alert("请选择要反审核的订单");
				return false;
			}
			$.post($url, {list:arr}, function(rs) {
				if (rs == 'SUCC') {
					alert('操作成功');
				} else {
					alert('操作失败');
				}
			});
		});

		//批量撤消订单
		$("#btnAllCancel").bind('click', function(){
			$url = '/transaction/order/ajax/allcancel';
			var orderIds = document.getElementsByName('cblist[]');
			if (orderIds == null) return false;
			var j = 0;
			var arr = new Array();
			for (var i = 0; i < orderIds.length; i++) {
				if (orderIds[i].checked) {
					arr[j] = orderIds[i].value;
					j++;
				}
			}
			if (arr.length == 0) {
				alert("请选择要撤消的订单");
				return false;
			}
			if(!confirm("您确定要撤消所选择的订单吗？")) {
				return false;
			}

			var dialog = KindEditor.dialog({
				width:300,
				title:"批量撤单",
				body : '<div id="refundOrderDiv" style="margin:20px;">'+
				'<form><input type="radio" name="refundType" value="balance" checked="checked"/>退回到账户余额<br />'+
				'<input type="radio" name="refundType" value="original" />原路径退回</form></div>',
				closeBtn : {
					name:"关闭",
					click : function(e){
						dialog.remove();
					}
				},
				noBtn :{
					name:"返回",
					click :function(e){
						dialog.remove();
					}
				},
				yesBtn:{
					name:"确定",
					click : function(e){
						var refundType = $('#refundOrderDiv :radio[name="refundType"]:checked').val();
						$.post($url, {list:arr, refund_type:refundType}, function(rs) {
							if (rs == 'SUCC') {
								alert('操作成功');
								dialog.remove();
							} else {
								alert('操作失败');
							}
						});
					}
				}
			});
		});
	},
	initDetailPlan:function(data){
		Zhiwo.Order.hideEasyBt();
		var html = '<div id="detail_tab">'+
						'<div id="dtb_" class="tb_">'+
							'<ul id="dtab_panel">'+
							'<li id="detail_basic" class="hovertab">基本信息</li>'+
							'<li id="detail_consignee" class="normaltab">收货人</li>'+
							'<li id="detail_goods" class="normaltab">商品</li>'+
							'<li id="detail_finance" class="normaltab">收退款</li>'+
							'<li id="detail_promotion" class="normaltab">优惠方案</li>'+
							'<li id="detail_remark" class="normaltab">订单备注</li>'+
							'<li id="detail_log" class="normaltab">订单日志</li>'+
							'<li id="detail_account" class="normaltab">客户账户</li>'+
							'<li id="detail_returned" class="normaltab">退货信息</li>'+
							'<li id="detail_order" class="normaltab">客户订单</li>'+
							'</ul>'+
						'</div>'+
					'</div>'+
					'<div id="detail_area" style="text-align:center;"></div>';

		$("#detail_panel div[id=detail_content]").html(html);
		$("#detail_panel li").each(function(){
			$(this).bind("click",function(){
				$(this).attr("class","hovertab");
				$("#detail_panel li[id!="+$(this).attr("id")+"]").each(function(){
					$(this).attr("class","normaltab");
				});
				switch ($(this).attr("id")){
					case "detail_basic":
						$("#detail_panel div[id=detail_area]").html(Zhiwo.Order.getBasicInfoHtml(data));
						//客审
						$("#detail_panel input[id=btnCExamine]").bind("click",function(){
							$url = '/transaction/order/ajax/cexamine/';
							$.get($url+data.order_id, function(res){
								if (res == 'SUCC') {
									alert('客审成功');
									$("#detail_panel input[id=btnCExamine]").hide();
								} else {
									alert('客审失败');
								}
							});
						});
						//财审
						$("#detail_panel input[id=btnFExamine]").bind("click",function(){
							$url = '/transaction/order/ajax/fexamine/';
							$.get($url+data.order_id, function(res){
								if (res == 'SUCC') {
									alert('财审成功');
									$("#detail_panel input[id=btnFExamine]").hide();
								} else {
									alert('财审失败');
								}
							});
						});
						//设置支付
						$("#detail_panel input[id=btnPay]").bind("click",function(){
							if(!confirm("您确定要设置已支付吗？")) {
								return false;
							}
							$url = '/transaction/order/ajax/payed/';
							$.get($url+data.order_id, function(res){
								if (res.errorno == 0) {
									alert('设置已支付成功');
									$("#detail_panel input[id=btnPay]").hide();
								} else {
									alert(res.errormsg);
								}
							});
						});
						//撤消订单
						$("#detail_panel input[id=btnCancel]").bind("click",function(){
							if(!confirm("您确定要撤消该订单吗？")) {
								return false;
							}
							var pay_way = $(this).attr('pay_way');
							var body='';
							//万里通支付只可原路径返回
							if(pay_way == 'Wltpay'){
								body = '<div id="refundOrderDiv" style="margin:20px;"><form><input type="radio" name="refundType" value="original"  />原路径退回(万里通支付只可原路径返回)</form></div>';
							}else{
								body = '<div id="refundOrderDiv" style="margin:20px;">'+
								   '<form><input type="radio" name="refundType" value="balance" checked="checked"/>退回到账户余额<br />'+
								   '<input type="radio" name="refundType" value="original"  />原路径退回</form></div>';
							}
							
							var dialog = KindEditor.dialog({
								width:300,
								title:"撤单",
								body :body,
								closeBtn : {
									name:"关闭",
									click : function(e){
										dialog.remove();
									}
								},
								noBtn :{
									name:"返回",
									click :function(e){
										dialog.remove();
									}
								},
								yesBtn:{
									name:"确定",
									click : function(e){
										$url = '/transaction/order/ajax/cancel/';
										var refundType = $('#refundOrderDiv :radio[name="refundType"]:checked').val();
										params = {order_id:data.order_id, refund_type:refundType};
										$.post($url, params, function(res){
											if (res.errorno == 0) {
												alert('撤消成功');
												$("#detail_panel input[id=btnCancel]").hide();
												dialog.remove();
											} else {
												alert(res.errormsg);
											}
										});
									}
								}
							});
						});
						//修改收货地址
						$("#detail_panel input[id=btnUpdateAddr]").bind("click",function(){
							var formStr = '<br /><form action="return false;" method="post">';
							formStr += '<table class="noborder">';
							formStr += '<tr><td width="80" align="right" valign="top">收货人姓名：</td><td align="left"><input type="text" id="receive_name" name="receive_name" value="'+data.receive_name+'" size="15" maxlength="6" /></td></tr>';
							formStr += '<tr><td width="80" align="right" valign="top">收货人手机：</td><td align="left"><input type="text" id="receive_mobile" name="receive_mobile" value="'+data.receive_mobile+'" size="15" maxlength="11" /></td></tr>';
							formStr += '<tr><td width="80" align="right" valign="top">收货省份：</td><td align="left"><input type="text" id="receive_province" name="receive_province" value="'+data.receive_province+'" size="8" /> &nbsp;&nbsp;城市：<input type="text" id="receive_city" name="receive_city" value="'+data.receive_city+'" size="8" /></td></tr>';
							formStr += '<tr><td width="80" align="right" valign="top">详细地址：</td><td align="left"><textarea id="receive_addr" name="receive_addr" rows="2" cols="38">'+data.receive_addr+'</textarea></td></tr>';
							formStr += '</table></form>';
							var dialog = KindEditor.dialog({
								width : 450,
								height : 260,
								title : '修改收货地址',
								body : '<div id="updateAddrBox">'+formStr+'</div>',
								closeBtn: {
									name: '关闭',
									click: function(e) {dialog.remove();}
								},
								yesBtn: {
									name: '确定',
									click: function(e) {
										var receiveName = document.getElementById("receive_name").value;
										var receiveMobile = document.getElementById("receive_mobile").value;
										var receiveProvince = document.getElementById("receive_province").value;
										var receiveCity = document.getElementById("receive_city").value;
										var receiveAddr = document.getElementById("receive_addr").value;
										var postParams = 'order_id='+data.order_id+'&receive_name='+encodeURIComponent(receiveName)+'&receive_mobile='+receiveMobile+'&receive_province='+encodeURIComponent(receiveProvince)+'&receive_city='+encodeURIComponent(receiveCity)+'&receive_addr='+encodeURIComponent(receiveAddr);
										$.post('/transaction/order/ajax/updateaddr',postParams, function(res) {
											if (res == 'SUCC') {
												alert('修改成功');
											} else {
												alert('修改失败');
											}
											dialog.remove();
										});
									}
								},
								noBtn: {
									name : '取消',
									click : function(e) {dialog.remove();}
								}
							});	
						});
						//接听并客审
						$("#detail_panel input[id=btnCExamineAndAnswer]").bind("click",function(){
							$url = '/transaction/order/ajax/cexamineanswer/';
							$.get($url+data.order_id, function(res){
								if (res == 'SUCC') {
									alert('接听并客审成功');
									$("#detail_panel input[id=btnCExamineAndAnswer]").hide();
								} else {
									alert('接听并客审失败');
								}
							});
						});
						//未接听
						$("#detail_panel input[id=btnNoAnswer]").bind("click",function(){
							$url = '/transaction/order/ajax/noanswer/';
							$.get($url+data.order_id, function(res){
								if (res == 'SUCC'){
									alert('未接听设置成功');
									$("#detail_panel input[id=btnNoAnswer]").hide();
								}else{
									alert('未接听设置失败');
								}
							});
						});
						//订单拒收
						$("#detail_panel input[id=btnRejection]").bind("click",function(){
							if(confirm('真的需要拒收此订单么？') == false){
								return false;
							}
							$url = '/transaction/order/ajax/rejection/';
							$.get($url+data.order_id, function(res){
								if (res == 'SUCC'){
									alert('拒收成功');
									$("#detail_panel input[id=btnRejection]").hide();
								}else if(res == 'ERR'){
									alert('错误的拒收订单信息');
								}else{
									alert('拒收失败');
								}
							});
						
						});

						//后台退货
						$("#detail_panel input[id=btnReturn]").bind("click",function() {
							var  timestamp = Date.parse(new Date());
							var strtime = timestamp.toString(); 
							timestamp = parseInt(strtime.substr(0,10));	//当前时间
							var ordertime =  parseInt(data.create_time);	//下单时间
							var timereal = timestamp - ordertime;
							if(timereal >= 3456000) {
								if(!confirm("订单已超过40天，确认退货么？")) {
									return false;
								}
							}

							$("#detail_area").html('Loading....');
							$goodsInfoUrl = '/transaction/order/ajax/goodsinfo?order_id='+data.order_id+'&randnum='+Math.random();
							$.get($goodsInfoUrl, function(res) {
								if (res.status == 'SUCC') {
									var htmlstr = '<form name="returnfrom"><table width="100%"><tr><td align="center">'+
									'<table width="97%" style="border:1px solid #ccc; border-collapse:collapse;" border="1">'+
									'<tr><td align="center"><div style="text-align:left;clear:right;margin-left:20px;"><strong>订单退货</strong></div></td></tr>'+
									'<tr><td align="center"><table width="97%" style="border:0px solid #ccc" cellpadding="0" cellspacing="1" bgcolor="#a8c7ce">'+
									'<tr><td width="15%" bgcolor="#FFFFFF" align="center"><b>商品ID</b></td><td width="15%" bgcolor="#FFFFFF" align="center"><b>购买场景</b></td><td width="10%" bgcolor="#FFFFFF" align="center"><b>商品单价</b></td><td width="40%" bgcolor="#FFFFFF" align="center"><b>货品名称</b></td><td width="10%" bgcolor="#FFFFFF" align="center"><b>购买数量</b></td><td width="10%" bgcolor="#FFFFFF" align="center"><b>退货数</b></td></tr>';
				
									for(var i=0;i<res.goodsInfo.length;i++) {
										var returnnumss = 'value="0"';
										var isshowbtn = 'none;';
										if(data.ship_status  == '0' || data.ship_status  == '1'){
											returnnumss = 'value="'+res.goodsInfo[i].quantity +'" readonly ';
											isshowbtn  = '';
										 }
											
										if (res.goodsInfo[i].obj_type == 'gift') {
											htmlstr += '<tr><td bgcolor="#FFFFFF" align="center">'+res.goodsInfo[i].goods_id+'</td><td bgcolor="#FFFFFF" align="center">'+res.goodsInfo[i].obj_type+'</td><td bgcolor="#FFFFFF" align="center">'+res.goodsInfo[i].price+'</td><td bgcolor="#FFFFFF" align="center"><span style="color:red;"><b>[赠品]</b></span>'+res.goodsInfo[i].name+'</td><td bgcolor="#FFFFFF" align="center">'+res.goodsInfo[i].quantity+'</td><td bgcolor="#FFFFFF" align="center"> <input type="hidden" name="returngoodstype[]" id="returngoodstype" value="'+ res.goodsInfo[i].obj_type +'"><input type="hidden" name="returngoodsid[]" id="returngoodsid" value="'+res.goodsInfo[i].goods_id+'"> <input type="text" size="2" name="returnnums[]" id="returnnums" '+returnnumss+' onkeyup="Zhiwo.Order.checkReturnGoods(this,'+res.goodsInfo[i].quantity+');" /></td></tr>';
										} else {
											htmlstr += '<tr><td bgcolor="#FFFFFF" align="center">'+res.goodsInfo[i].goods_id+'</td><td bgcolor="#FFFFFF" align="center">'+res.goodsInfo[i].obj_type+'</td><td bgcolor="#FFFFFF" align="center">'+res.goodsInfo[i].price+'</td><td bgcolor="#FFFFFF" align="center">'+res.goodsInfo[i].name+'</td><td bgcolor="#FFFFFF" align="center">' + res.goodsInfo[i].quantity + '</td><td bgcolor="#FFFFFF" align="center"> <input type="hidden" name="returngoodstype[]" id="returngoodstype" value="'+ res.goodsInfo[i].obj_type +'"> <input type="hidden" name="returngoodsid[]" id="returngoodsid" value="'+res.goodsInfo[i].goods_id+'"><input type="text"  size="2" name="returnnums[]" id="returnnums" '+returnnumss+' onkeyup="Zhiwo.Order.checkReturnGoods(this,'+res.goodsInfo[i].quantity+');" /></td></tr>';
										}
									}                                
									htmlstr += '<tr align="left"><td><b>退货原因：</b></td><td colspan="3"><select name="returncomm" id="returncomm">';
									htmlstr += '<option value="不满意">不满意</option>';
									htmlstr += '<option value="购买重复">购买重复</option>';
									htmlstr += '<option value="缺货商品">缺货商品</option>';
									htmlstr += '<option value="商品有缺陷">商品有缺陷</option>';
									htmlstr += '<option value="使用过敏">使用过敏</option>';
									htmlstr += '<option value="商品寄送错误" >商品寄送错误</option>';
									htmlstr += '<option value="其他">其他</option>';
									htmlstr += '</select><input type="text" name="return_reason_other" id="return_reason_other" size="50" style="display:none;" /> <font color="#FF0000">*</font></td></tr>';
									htmlstr += '<tr align="left"><td> <b>联系人：</b></td><td colspan="3"><input type="text" name="returnuser" id="returnuser" value="'+data.receive_name +'" /> <font color="#FF0000">*</font></td></tr>';
									htmlstr += '<tr align="left"><td><b>联系手机/电话：</b></td><td colspan="3"> <input type="text" name="returnmobile" id="returnmobile" value="'+data.receive_mobile +'" /> <font color="#FF0000">*</font></td></tr>';
									htmlstr += '<tr align="left"><td><b>退款方式：</b></td><td colspan="3"> <input type="radio" value="balance" checked  name="returnway" id="returnway" /> 退到知我余额 &nbsp;&nbsp;<input type="radio" value="original" name="returnway" id="returnway" /> 原路退回</td></tr>';
									htmlstr += '<tr align="left"><td><b>寄回物流公司：</b></td><td colspan="3"> <input type="text" value="" name="returncompany" id="returncompany" /></td></tr>';
									htmlstr += '<tr align="left"><td><b>寄回物流单号：</b></td><td colspan="3"> <input type="text" value="" name="returndeliveryid" id="returndeliveryid" /> <font color="#FF0000">*</font></td></tr>'; 
									htmlstr += '<tr><td colspan="4"><input type="hidden" name="returnorderid" id="returnorderid" value="'+data.order_id+'" /><input type="button" value="确认退货" id="returnConfirm" style="display:'+isshowbtn+';" /></td></tr>';
									htmlstr += '</td></tr></table></form>';
									$("#detail_area").html(htmlstr);
								} else {
									$("#detail_area").html('无商品记录');
								}
							});
						});
						$("#detail_panel select[id=returncomm]").live("change",function(){
							if($("#detail_area select[id=returncomm]").val()  == '其他'){
								$("#detail_area input[id=return_reason_other]").show();
							}else{
								$("#detail_area input[id=return_reason_other]").hide();
								document.getElementById('return_reason_other').value = '';
							}
						});
						
						//提交退货		
						$("#detail_panel input[id=returnConfirm]").live("click",function() {
							if($("#detail_panel input[id=returnuser]").val() == '') {
								alert('请填写联系人姓名后再退货');
								return false;
							}
							if($("#detail_panel input[id=returnmobile]").val() == '') {
								alert('请填写联系人电话后再退货');
								return false;
							}
							if($("#detail_panel input[id=returndeliveryid]").val() == '') {
								alert('请填写寄回包裹的物流单号');
								return false;
							}
							
							var goodstr = '';       
							for (var i=0;i<$("#detail_area input[id=returnnums]").length;i++) {
								var temp_num = parseInt($("#detail_area input[id=returnnums]")[i].value);
								var temp_goods = parseInt($("#detail_area input[id=returngoodsid]")[i].value );
								var temp_type  = $("#detail_area input[id=returngoodstype]")[i].value;
								if(temp_num > 0) {
									goodstr += temp_type + '_' + temp_goods + '_' + temp_num + '|';
								}
							}
							var returnorderid = $("#detail_area input[id=returnorderid]").val() ;
							var returncomm = $("#detail_area select[id=returncomm]").val() ;
							var returnuser = $("#detail_area input[id=returnuser]").val() ;
							var returnmobile = $("#detail_area input[id=returnmobile]").val() ;
							var returnway = $("#detail_area input[id=returnway]:checked").val() ;
							var returncompany = $("#detail_area input[id=returncompany]").val() ;
							var returndeliveryid = $("#detail_area input[id=returndeliveryid]").val() ;
							var return_reason_other = $("#detail_area input[id=return_reason_other]").val() ;
							
							var cur_url = '/transaction/order/ajax/return/' + returnorderid;
							$.post(cur_url,{goodstr:goodstr, returncomm:returncomm, returnuser:returnuser, returnmobile:returnmobile, returnway:returnway, returncompany:returncompany, returndeliveryid:returndeliveryid,return_reason_other:return_reason_other}, function(data){
								if(data == '1') {  
									$("#detail_area input[id=returnConfirm]").hide();
									$("#detail_panel input[id=btnReturn]").hide();
									alert('退货成功');
								}else if (data == '2'){
									alert('没有填写退货的数量');
								}else if (data == '3' || data == '10' ){
									alert('填写退货的数量都是0');
								}else if (data == '4'){
									alert('没有获取到退货订单ID');
								}else if (data == '5'){
									alert('没有获取到退货原因');
								}else if (data == '6'){
									alert('没有获取到退货联系人');
								}else if (data == '7'){
									alert('没有获取到退货联系电话');
								}else if (data == '8'){
									alert('此订单不存在');
								}else if (data == '9'){
									alert('此订单没有货品信息');
								}else if (data == '10'){
									alert('此订单是无效订单');
								}else if (data == '11'){
									alert('此订单没有付款');
								}else if (data == '12'){
									alert('此订单已在退货中');	
								}else if (data == '13'){
									alert('该账期订单还有未结金额');
	
								}else{
									alert('退货失败');
								}
							});
						});
						$("#detail_panel input[id=btnSplit]").bind("click",function(){
							var order_id = $(this).attr("OrderId");
							if(confirm("你确定要拆分" + order_id +"号订单吗？")){
								location.href = '/transaction/order/split?order_id=' + order_id;
							}
						});
						//订单调仓
						$("#detail_panel input[id=btnChangeHouse]").bind("click",function(){

							if(Zhiwo.Order.isLoading == true){

								return false;
							}

							Zhiwo.Order.isLoading = true;

							$.get('/transaction/order/changehouseinfo?order_id='+ data.order_id +'randnum='+ Math.random(), function (response){

								Zhiwo.Order.isLoading = false;

								if(response.errno != 0){

									alert('仓库信息获取错误');
									return false;
								}

								var orderHouseName = '';
								var optionHtml = '<option value="">==请选择==</option>';

								for(var i = 0; i < response.content.length; ++i){

									var house = response.content[i];

									if(house.house_code == data.store_id){

										orderHouseName = house.house_name;
										continue;
									}

									optionHtml += '<option value="'+ house.house_code +'">'+ house.house_name +'</option>';
								}

								var formStr = '<br /><form action="return false;" method="post">';
									formStr += '<table class="noborder">';
									formStr += '<tr><td width="80" align="right" valign="top">所在仓库：</td><td align="left">'+ orderHouseName +'</td></tr>';
									formStr += '<tr><td width="80" align="right" valign="top">目的仓库：</td><td align="left"><select name="target_house_code">'+ optionHtml +'</select></td></tr>';
									formStr += '<tr><td width="80"></td><td id="change_house_msg"></td></tr>';
									formStr += '</table></form>';

								var dialog = KindEditor.dialog({
									width : 450,
									height : 260,
									title : '订单调仓',
									body : '<div id="changeHouseBox">'+formStr+'</div>',
									closeBtn: {
										name: '关闭',
										click: function(e) {dialog.remove();}
									},
									yesBtn: {
										name: '确定',
										click: function(e) {

											if(Zhiwo.Order.isLoading == true){

												return false;
											}

											Zhiwo.Order.isLoading = true;

											var targetHouseCode = $('select[name="target_house_code"]').val();

											if(!targetHouseCode){

												alert('请选择目的仓库');
												Zhiwo.Order.isLoading = false;
												return false;
											}

											$('td#change_house_msg').html('Loading....');

											$.post(
												'/transaction/order/changehouse',
												{
													order_id: data.order_id,
													target_house_code: targetHouseCode
												},
												function (response){

													Zhiwo.Order.isLoading = false;

													if(response.errno == 0){

														$('tr#row_'+ data.order_id +' div[name="ship_status_str"]').html(response.content);
														data.store_id = targetHouseCode;

														alert('操作成功');
														dialog.remove();
													}
													else{

														$('td#change_house_msg').html(response.content);
													}
												},
												'json'
											);
										}
									},
									noBtn: {
										name : '取消',
										click : function(e) {dialog.remove();}
									}
								});

							}, 'json');
						});
						break;
					case "detail_goods":
						$("#detail_area").html('Loading....');
						$url = '/transaction/order/ajax/goodsinfo?order_id='+data.order_id+'&randnum='+Math.random();
						$.get($url, function(res) {
							if (res.status == 'SUCC') {
								$("#detail_panel div[id=detail_area]").html(Zhiwo.Order.getGoodsInfoHtml(res.goodsInfo));    
							} else {
								$("#detail_area").html('无商品记录');
							}
						});
						break;
					case "detail_finance":
						$("#detail_panel div[id=detail_area]").html(Zhiwo.Order.getFinanceInfoHtml(data));
						break;
					case "detail_promotion":
						//$("#detail_panel div[id=detail_area]").html(Zhiwo.Order.getCouponInfoHtml(data));
						$("#detail_area").html('Loading....');
						$url = '/transaction/order/ajax/promotion?order_id='+data.order_id+'&randnum='+Math.random();
						$.get($url, function(res) {
							if (res.status == 'SUCC') {
								$("#detail_panel div[id=detail_area]").html(Zhiwo.Order.getPromotionInfoHtml(res.promotionInfo));
							} else {
								$("#detail_area").html('未查询到优惠方案');
							}
						});
						break;
					case "detail_remark":
						$("#detail_panel div[id=detail_area]").html(Zhiwo.Order.getRemarkInfoHtml(data));
						$("input[id=btnmark]").bind('click', function(){
							var dataparams = new Object();
							var mid = $('#detail_panel #mark_text').val();
							dataparams = {order_id:data.order_id, mark_text:mid};
							$.post('/transaction/order/remark/add', {data: dataparams}, function(res){
								if (res == 'SUCC'){
									alert('备注保存成功');
									return true;
								} else {
									alert('备注保存失败');
									return false;
								}
							});
						});
						break;
					case "detail_consignee":
						$("#detail_area").html('Loading....');
						$url = '/transaction/order/ajax/consignee?order_id='+data.order_id+'&randnum='+Math.random();
						$.get($url, function(res) {
							if (res.status == 'SUCC') {
								$("#detail_panel div[id=detail_area]").html(Zhiwo.Order.getConsigneeInfoHtml(res.consigneeInfo));
							} else {
								$("#detail_area").html('未查询到收货人信息');
							}
						});
						break;
					case "detail_log":
						$("#detail_area").html('Loading....');
						$url = '/transaction/order/ajax/loginfo?order_id='+data.order_id+'&randnum='+Math.random();
						$.get($url, function(res) {
							if (res.status == 'SUCC') {
								$("#detail_panel div[id=detail_area]").html(Zhiwo.Order.getLogInfoHtml(res.logInfo));
							} else {
								$("#detail_area").html('无日志记录');
							}
						});
						break;
					case "detail_account":
						$("#detail_area").html('Loading....');
						$url = '/transaction/order/ajax/accountinfo?member_id='+data.member_id+'&randnum='+Math.random();
						$.get($url, function(res) {
							if (res.status == 'SUCC') {
								$("#detail_panel div[id=detail_area]").html(Zhiwo.Order.getAccountInfoHtml(res.accountInfo));
							} else {
								$("#detail_area").html('无帐户记录');
							}
						});
						break;
					case "detail_returned":
						$("#detail_area").html('Loading....');
						$url = '/transaction/order/ajax/reshipinfo?order_id='+data.order_id+'&randnum='+Math.random();
						$.get($url, function(res) {
							if (res.status == 'SUCC') {
								$("#detail_panel div[id=detail_area]").html(Zhiwo.Order.getReturnedInfoHtml(data, res.reshipInfo));
							} else {
								$("#detail_area").html('无退货记录');
							}
						});
						break;
					case "detail_order":
						$("#detail_area").html('Loading....');
						$url = '/transaction/order/ajax/orderinfo?mobile='+data.receive_mobile_64+'&randnum='+Math.random();
						$.get($url, function(res) {
							if (res.status == 'SUCC') {
								var str = '<table width="97%" cellspacing="1" bgcolor="#a8c7ce" style="margin: 15px">';
									str += '<tr><td align="center" bgcolor="#FFFFFF">订单号</td>';
									str += '<td align="center" bgcolor="#FFFFFF">下单时间</td>';
									str += '<td align="center" bgcolor="#FFFFFF">订单金额</td>';
									str += '<td align="center" bgcolor="#FFFFFF">付款状态</td>';
									str += '<td align="center" bgcolor="#FFFFFF">发货状态</td>';
									str += '<td align="center" bgcolor="#FFFFFF">配货时间</td>';
									str += '<td align="center" bgcolor="#FFFFFF">订单状态</td></tr>';
								for (var i in res.orderInfo) {
									str += '<tr>';
									str += '<td align="center" bgcolor="#FFFFFF">'+res.orderInfo[i].order_id+'</td>';
									str += '<td align="center" bgcolor="#FFFFFF">'+res.orderInfo[i].create_time+'</td>';
									str += '<td align="center" bgcolor="#FFFFFF">'+res.orderInfo[i].total_amount+'</td>';
									str += '<td align="center" bgcolor="#FFFFFF">'+res.orderInfo[i].pay_status+'</td>';
									str += '<td align="center" bgcolor="#FFFFFF">'+res.orderInfo[i].ship_status+'</td>';
									str += '<td align="center" bgcolor="#FFFFFF">'+res.orderInfo[i].picking_time+'</td>';
									str += '<td align="center" bgcolor="#FFFFFF">'+res.orderInfo[i].order_status+'</td>';
									str += '</tr>';
								}
								str += '</table>';
								$("#detail_panel div[id=detail_area]").html(str);
							} else {
								$("#detail_area").html('无订单记录');
							}
						});
						break;
				}
			});
		});
		$("#detail_tab li[id^=detail_basic]").click();
		if (Zhiwo.Order.showRemark == 1) {
			$("#detail_remark").click();
			Zhiwo.Order.showRemark = 0;
		}
	},
	
	getOrderDetailHtml:function(){
		var html = $("#dpanel").html();
		html ='<tr id="detail_panel"><td colspan="16" bgcolor="#FFFFFF" class="STYLE6">'+html+'</td></tr>';
		return html;
	},
	getBasicInfoHtml:function(data){
		var html = '<div style="align:left;clear:right;"><ul style="float:left;margin-top:8px">';
		if (data.order_status == 'active') {
			if ((data.ship_status =='0' || data.ship_status =='1') && data.pay_status != '0') {
				html += '<li style="float:left;">&nbsp;&nbsp;&nbsp; <input type="button" id="btnSplit" value="拆单" orderId="' + data.order_id + '" />&nbsp; </li>';
				html += '<li style="float:left;">&nbsp;&nbsp;&nbsp; <input type="button" id="btnChangeHouse" value="调仓" orderId="' + data.order_id + '" />&nbsp; </li>';
			}
			if (data.client_examine == '0') {
				html += '<li style="float:left;">&nbsp;&nbsp;&nbsp; <input type="button" id="btnCExamine" value="客审" />&nbsp; </li>';
			}
			if (data.financial_examine == '0') {
				html += '<li style="float:left;">&nbsp;&nbsp;&nbsp; <input type="button" id="btnFExamine" value="财审" />&nbsp; </li>';
			}
			if (data.answer_state =='0') {
				html += '<li style="float:left;">&nbsp;&nbsp;&nbsp; <input type="button" id="btnCExamineAndAnswer" value="接听并客审" />&nbsp; </li>';
				html += '<li style="float:left;">&nbsp;&nbsp;&nbsp; <input type="button" id="btnNoAnswer" value="未接听" />&nbsp; </li>';
			} 
			if (data.answer_state =='1') {
				html += '<li style="float:left;">&nbsp;&nbsp;&nbsp; <input type="button" id="btnCExamineAndAnswer" value="接听并客审" />&nbsp; </li>';
			} 
			if (data.ship_status =='0' || data.ship_status =='1' || data.ship_status =='2' || data.ship_status =='6') {
				html += '<li style="float:left;">&nbsp;&nbsp;&nbsp; <input type="button" id="btnUpdateAddr" value="修改收货地址" />&nbsp; </li>';
				html += '<li style="float:left;">&nbsp;&nbsp;&nbsp; <input type="button" id="btnCancel" value="撤单" pay_way="'+data.pay_way+'" />&nbsp; </li>';
			}
		}
		if (data.pay_status =='2' && data.ship_status =='3' && data.reship_type =='0' && data.pay_way =='COD') {
			html += '<li style="float:left;">&nbsp;&nbsp;&nbsp; <input type="button" id="btnRejection" value="拒收" title="货到付款订单客户拒收" />&nbsp; </li>';
		}
		if (data.order_status == 'active' || data.order_status == 'finish') {
			if (data.pay_status=='1' && data.ship_status=='3' && data.reship_status=='0'){
				//主要帮顾客操作前台超时订单
				html += '<li style="float:left;">&nbsp;&nbsp;&nbsp; <input type="button" id="btnReturn" value="退货" title="客服替顾客退货" />&nbsp; </li>';
			}
		}
		if (data.pay_status=='0') {
			//重新设置支付信号同步失败的订单
			html += '<li style="float:left;">&nbsp;&nbsp;&nbsp; <input type="button" id="btnPay" value="重置支付" />&nbsp; </li>';
		}
		
		html += '</ul></div>';

		html += '<table width="100%"><tr><td align="center">'+
					'<table width="97%" style="border:1px solid #ccc; border-collapse:collapse;">'+
					'<thead><tr><td width="20%" height="23" valign="middle"><strong>订单费用</strong></td>'+
					'<td width="30%" height="23" valign="middle"><strong>订单其他信息</strong></td>'+
					'<td width="20%" height="23" valign="middle"><strong>会员信息</strong></td>'+
					'<td width="30%" height="23" valign="middle"><strong>备注</strong></td></tr>'+
					'<tr><td colspan="4"><hr /></td></tr></thead>'+
					'<tbody><tr><td align="center"><table>'+
					'<tr><td align="right">商品总额:</td><td align="left">'+data.goods_amount+'</td></tr>'+
					'<tr><td align="right">配送费用:</td><td align="left">'+data.freight+'</td></tr>'+
					'<tr><td align="right">商品税费:</td><td align="left">'+data.real_tax_rate+'</td></tr>'+
					'<tr><td align="right">优惠金额:</td><td align="left">'+data.coupon_amount+'</td></tr>'+
					'<tr><td align="right">实付总额:</td><td align="left">'+data.total_amount+'</td></tr>'+
					'<tr><td align="right">预存款支付:</td><td align="left">'+data.balance_amount+'</td></tr>'+
					'<tr><td align="right">在线支付:</td><td align="left">'+data.need_amount+'</td></tr>'+
					'<tr><td align="right">订单流水:</td><td align="left">'+data.gross_amount+'</td></tr>'+
					'<tr><td align="right">消费积分:</td><td align="left">'+data.score_used+'</td></tr></table></td>'+
					'<td align="center"><table>'+
					'<tr><td align="right">配送方式:</td><td align="left">'+data.delivery_channel+'</td></tr>'+
					'<tr><td align="right">支付方式:</td><td align="left">'+data.payment+'</td></tr>'+
					'<tr><td align="right">来源渠道:</td><td align="left">'+data.order_channel+'</td></tr>'+
					'<tr><td align="right">来源单号:</td><td align="left">'+data.src_order_id+'</td></tr>'+
					'</table></td><td align="center"><table>'+
					'<tr><td align="right">用户名:</td><td align="left">'+data.member.login_name+'</td></tr>'+
					'<tr><td align="right">姓名:</td><td align="left">'+data.member.name+'</td></tr>'+
					'<tr><td align="right">注册时间:</td><td align="left">'+data.member.regtime+'</td></tr>'+
					'<tr><td align="right">注册来源:</td><td align="left">'+data.member.reg_from+'</td></tr>'+
					'</table></td><td align="center"><table>'+
					'<tr><td align="right">会员留言:</td><td align="left">'+data.message+'</td></tr>'+
					'<tr><td align="right">后台备注:</td><td align="left">'+data.memo+'</td></tr>'+
					'</table></td>'+
					'</tr>'+
					'</tbody></table></td></tr></table>';
		return html;
	},
	getAccountInfoHtml:function(account){
		var html = '<table width="100%"><tr><td align="center">'+
					'<div style="text-align:left;clear:right;margin-left:20px;"><strong>目前账户余额：￥'+account.advance+'</strong>&nbsp; | &nbsp;<strong>账户冻结金额：￥'+account.advance_freeze+'</strong></div></td></tr>'+
					'<tr><td>'+
					'<table width="97%" cellspacing="1" bgcolor="#a8c7ce">'+
					'<tr><td width="60" align="center" bgcolor="#FFFFFF">序号</td><td width="150" align="center" bgcolor="#FFFFFF">时间</td><td width="60" align="center" bgcolor="#FFFFFF">类别</td><td width="80" align="center" bgcolor="#FFFFFF">用途</td>'+
					'<td width="60" align="center" bgcolor="#FFFFFF">金额</td><td width="60" align="center" bgcolor="#FFFFFF">余额</td><td width="60" align="center" bgcolor="#FFFFFF">支付方式</td><td width="120" align="center" bgcolor="#FFFFFF">关联单号</td><td align="center" bgcolor="#FFFFFF">业务摘要</td></tr>';
					for(var i = 0 ; i < account.logs.length; i++){
						html+='<tr>';
						html+='<td align="center" bgcolor="#FFFFFF">'+(i+1)+'</td>';
						html+='<td align="center" bgcolor="#FFFFFF">'+account.logs[i].gen_time+'</td>';
						html+='<td align="center" bgcolor="#FFFFFF">'+account.logs[i].gen_type+'</td>';
						html+='<td align="center" bgcolor="#FFFFFF">'+account.logs[i].act_type_str+'</td>';
						html+='<td align="center" bgcolor="#FFFFFF">'+account.logs[i].gen_money+'</td>';
						html+='<td align="center" bgcolor="#FFFFFF">'+account.logs[i].final_balance+'</td>';
						html+='<td align="center" bgcolor="#FFFFFF">'+account.logs[i].pay_way+'</td>';
						html+='<td align="center" bgcolor="#FFFFFF">'+account.logs[i].order_id+'</td>';
						html+='<td align="center" bgcolor="#FFFFFF">'+account.logs[i].memo+'</td>';
						html+='</tr>';
					}
					html+='</table>';
		return html;
	},
	getConsigneeInfoHtml:function(data){
		var html = '<table width="100%">'+
				'<tr><td>'+
					'<table width="97%" cellspacing="1" bgcolor="#a8c7ce">'+
						'<tr><td align="center" bgcolor="#FFFFFF">收货姓名</td><td align="center" bgcolor="#FFFFFF">手机</td><td align="center" bgcolor="#FFFFFF">电话</td><td align="center" bgcolor="#FFFFFF">收货地址</td>'+
						'<td align="center" bgcolor="#FFFFFF">邮编</td><td align="center" bgcolor="#FFFFFF">Email</td></tr>';
		
			html+='<tr>';
			html+='<td align="center" bgcolor="#FFFFFF">'+data.receive_name+'</td>';
			html+='<td align="center" bgcolor="#FFFFFF">'+data.receive_mobile+'</td>';
			html+='<td align="center" bgcolor="#FFFFFF">'+data.receive_tel+'</td>';
			html+='<td align="center" bgcolor="#FFFFFF">'+data.receive_addr+'</td>';
			html+='<td align="center" bgcolor="#FFFFFF">'+data.receive_zip+'</td>';
			html+='<td align="left" bgcolor="#FFFFFF">'+data.email+'</td>';
			html+='</tr>';
		html+='</table></td></tr></table>';
		return html;
	},
	getLogInfoHtml:function(logs){
		var html = '<table width="100%">'+
						'<tr><td align="center"><div style="text-align:left;clear:right;margin-left:20px;"><strong>订单日志</strong></div></td></tr>'+
						'<tr><td>'+
						'<table width="97%" cellspacing="1" bgcolor="#a8c7ce">'+
							'<tr><td align="center" bgcolor="#FFFFFF">序号</td><td align="center" bgcolor="#FFFFFF">时间</td><td align="center" bgcolor="#FFFFFF">操作人</td>'+
							'<td align="center" bgcolor="#FFFFFF">行为</td><td align="center" bgcolor="#FFFFFF">结果</td><td align="left" bgcolor="#FFFFFF">备注</td></tr>';
		for(var i = 0; i < logs.length; i++){
			html+='<tr>';
			html+='<td align="center" bgcolor="#FFFFFF">'+(i+1)+'</td>';
			html+='<td align="center" bgcolor="#FFFFFF">'+logs[i].alttime_str+'</td>';
			html+='<td align="center" bgcolor="#FFFFFF">'+logs[i].op_name+'</td>';
			html+='<td align="center" bgcolor="#FFFFFF">'+logs[i].behavior_str+'</td>';
			html+='<td align="center" bgcolor="#FFFFFF">'+logs[i].result_str+'</td>';
			html+='<td align="left" bgcolor="#FFFFFF">'+logs[i].log_text+'</td>';
			html+='</tr>';
		}
		html+='</table></td></tr></table>';
		return html;
	},
	getRemarkInfoHtml:function(data){
		var html = '<form id="remark_form" method="post"><input type="hidden" name="order_id" value="'+data.order_id+'" />'+
					'<table width="97%" style="border:1px solid #ccc; border-collapse:collapse;">'+
					'<tr><td width="150" height="26" align="right" valign="middle">客户留言：&nbsp;</td><td align="left" bgcolor="#FFFFFF">'+data.message+'</td></tr>';
					
		html +=	'<tr><td width="150" height="26" align="right" valign="middle">后台备注：&nbsp;</td><td align="left" bgcolor="#FFFFFF">'+
				'<table width="98%" style="border:1px solid #ccc; border-collapse:collapse;">';
		for (var i=0;i<data.remarkslist.length;i++) {
			html +=	'<tr><td height="26">'+data.remarkslist[i].op_name+'['+data.remarkslist[i].op_time+'] &nbsp;'+data.remarkslist[i].remarks+'</td></tr>';
			}
		html +=	'</table></td></tr>';
		html +=	'<tr><td width="150" align="right" valign="top">添加备注：&nbsp;</td><td align="left" bgcolor="#FFFFFF"><textarea id="mark_text" name="mark_text" rows="2" cols="50"></textarea></td></tr>'+
				'<tr><td width="150" align="right" bgcolor="#FFFFFF">&nbsp;</td><td align="left" bgcolor="#FFFFFF"><input type="button" id="btnmark" value="保存" /></td></tr>'+
				'</table></form>';  
		return html;
	},
	getPromotionInfoHtml:function(data){
		var html = '<table width="100%">'+
						'<tr><td align="center"><div style="text-align:left;clear:right;margin-left:20px;"><strong>优惠方案</strong></div></td></tr>'+
						'<tr><td>'+
						'<table width="97%" cellspacing="1" bgcolor="#a8c7ce">'+
							'<tr><td width="60" align="center" bgcolor="#FFFFFF">序号</td><td width="100" align="center" bgcolor="#FFFFFF">优惠类型</td><td width="150" align="center" bgcolor="#FFFFFF">使用时间</td><td bgcolor="#FFFFFF">优惠方案</td></tr>';
		for(var i = 0; i < data.length; i++){
			html+='<tr>';
			html+='<td width="60" align="center" bgcolor="#FFFFFF">'+(i+1)+'</td>';
			html+='<td width="100" align="center" bgcolor="#FFFFFF">'+data[i].op_type+'</td>';
			html+='<td width="150" align="center" bgcolor="#FFFFFF">'+data[i].op_time+'</td>';
			html+='<td align="left" bgcolor="#FFFFFF">'+data[i].op_info+'</td>';
			html+='</tr>';
		}
		html+='</table></td></tr></table>';
		return html;
	},
	getFinanceInfoHtml:function(data){
		var html = '<table width="100%"><tr><td align="center">'+
						'<table width="97%" style="border:1px solid #ccc; border-collapse:collapse;">'+
						'<tr><td align="center"><div style="text-align:center;clear:right;margin-left:20px;"><strong>收款单据列表</strong></div></td><td align="center"><div style="text-align:center;clear:right;margin-left:20px;"><strong>退款单据列表</strong></div></td></tr>'+
						'<tr><td>'+
						'<table width="97%" cellspacing="1" bgcolor="#a8c7ce">'+
						'<tr><td align="center" bgcolor="#FFFFFF">单据时间</td><td align="center" bgcolor="#FFFFFF">支付金额</td><td align="center" bgcolor="#FFFFFF">支付方式</td><td align="center" bgcolor="#FFFFFF">状态</td></tr>';
						for( var i=0; i < data.payments_list.length ; i ++){
							html +='<tr>';
							html +='<td align="center" bgcolor="#FFFFFF">'+data.payments_list[i].pay_time_str+
							'</td><td align="center" bgcolor="#FFFFFF">'+data.payments_list[i].pay_amount+
							'</td><td align="center" bgcolor="#FFFFFF">'+data.payments_list[i].pay_way+
							'</td><td align="center" bgcolor="#FFFFFF">'+data.payments_list[i].pay_status+'</td>';
							html +='</tr>';
						}
						html +='</table></td><td>'+
						'<table width="97%" cellspacing="1" bgcolor="#a8c7ce">'+
						'<tr><td align="center" bgcolor="#FFFFFF">单据时间</td><td align="center" bgcolor="#FFFFFF">支付金额</td><td align="center" bgcolor="#FFFFFF">支付方式</td><td align="center" bgcolor="#FFFFFF">状态</td></tr>';
						for( var i=0; i < data.refunds_list.length; i++){
							html +='<tr>';
							html +='<td align="center" bgcolor="#FFFFFF">'+data.refunds_list[i].pay_time_str+
							'</td><td align="center" bgcolor="#FFFFFF">'+data.refunds_list[i].pay_amount+
							'</td><td align="center" bgcolor="#FFFFFF">'+data.refunds_list[i].pay_way+
							'</td><td align="center" bgcolor="#FFFFFF">'+data.refunds_list[i].pay_status+'</td>';
							html +='</tr>';
						}
						html +='</table></td></tr></table>'+
					'</td></tr></table>';
		return html;
	},
	getGoodsInfoHtml:function(data){
		var html = '<table width="100%"><tr><td><div style="text-align:left;clear:right;margin-left:20px;"><strong>商品信息</strong></div></td></tr>'+
						'<tr><td>'+
						'<table width="96%" style="border:0px solid #ccc" cellpadding="0" cellspacing="1" bgcolor="#a8c7ce">'+
						'<tr><td width="70" bgcolor="#FFFFFF" align="center">类型</td><td width="60" bgcolor="#FFFFFF" align="center">商品ID</td><td width="200" bgcolor="#FFFFFF" align="center">商品名称</td><td width="60" bgcolor="#FFFFFF" align="center">所在仓库</td><td width="60" bgcolor="#FFFFFF" align="center">商品单价</td><td width="60" bgcolor="#FFFFFF" align="center">消费积分</td><td width="60" bgcolor="#FFFFFF" align="center">购买数量</td><td width="60" bgcolor="#FFFFFF" align="center">商品库存</td><td width="100" bgcolor="#FFFFFF" align="center">SKU号</td><td width="200" bgcolor="#FFFFFF" align="center">货品名称</td><td width="60" bgcolor="#FFFFFF" align="center">SKU库存</td></tr>';

					for(var i=0;i<data.length;i++) {
						for(var j=0, k=data[i].sku_list.length; j<k; j++) {
							html += '<tr>';
							if (j==0) {
								if (data[i].obj_type == 'group') {
									html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center">团购</td>';
								} else if(data[i].obj_type == 'mall') {
									html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center">商城</td>';
								} else if(data[i].obj_type == 'raise') {
									html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center"><span style="color:red;">[换购]</span></td>';
								} else if(data[i].obj_type == 'privilege') {
									html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center"><span style="color:red;">[满赠]</span></td>';
								}  else if(data[i].obj_type == 'exchange') {
									html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center"><span style="color:red;">[兑换]</span></td>';
								} else if(data[i].obj_type == 'gift') {
									html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center"><span style="color:red;">[赠品]</span></td>';
								} else if(data[i].obj_type == 'seaamoy') {
									html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center"><span style="color:red;">[海淘]</span></td>';
								} else {
									html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center">未知</td>';
								}
								if (window.location.host == 'shopadmin.test') {
									var host = 'http://newdev.zhiwo.com';
								} else {
									var host = 'http://www.zhiwo.com';
								}
								if (data[i].obj_type == 'group') {
									html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center"><a href="'+host+'/group/'+data[i].goods_id+'.html" target="_blank">'+data[i].goods_id+'</a></td>';
								} else if(data[i].obj_type == 'seaamoy'){
                                                                        html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center"><a href="'+host+'/higo/'+data[i].goods_id+'.html" target="_blank">'+data[i].goods_id+'</a></td>';
                                                                }else {
									html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center"><a href="'+host+'/product/'+data[i].goods_id+'.html" target="_blank">'+data[i].goods_id+'</a></td>';
								}
								html += '<td rowspan='+k+' bgcolor="#FFFFFF" width="200">'+data[i].name+'</td>';
								html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center">'+data[i].store_name+'</td>';
								html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center">'+data[i].price+'</td>';
								html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center">'+data[i].score+'</td>';
								html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center">'+data[i].quantity+'</td>';
								html += '<td rowspan='+k+' bgcolor="#FFFFFF" align="center">'+data[i].goods_stock+'</td>';
							}
							html += '<td bgcolor="#FFFFFF" width="120">'+data[i].sku_list[j].sku_pack+'</td>';
							html += '<td bgcolor="#FFFFFF" width="200">'+data[i].sku_list[j].product_name+'</td>';
							html += '<td bgcolor="#FFFFFF" align="center">'+data[i].sku_list[j].left_stock+'</td>';
							html += '</tr>';
						}
					}
			html +='</table></td></tr></table>';
		return html;
	},
	getReturnedInfoHtml:function(data, reshipInfo){
		var t='';
		var html = '<div style="align:left;clear:right;height:30px; padding-top:3px;"><ul style="float:left;">'+
				'<li style="float:left;">退货操作: &nbsp;<input type="hidden" id="reship_order_id" value="'+reshipInfo.order_id+'" /></li>'+
				'<li style="float:left;"><input type="button" value="修改" onclick="Zhiwo.Order.showReshipInfo();" />&nbsp;&nbsp;&nbsp;</li>'+
				'<li style="float:left;"><input type="button" value="取消退货" onclick="Zhiwo.Order.cancelReship();" />&nbsp;</li>';
			if (reshipInfo.item_status == '-1') {
				html += '<li style="float:left; background-color:#cdc;"><input type="radio" name="reshipOrExchange" value="1" onchange="document.getElementById(\'auditExchangeBtn\').disabled=false;document.getElementById(\'auditReshipBtn\').disabled=true;" />换货 ';
				html += '<input type="radio" name="reshipOrExchange" value="2" onchange="document.getElementById(\'auditExchangeBtn\').disabled=true;document.getElementById(\'auditReshipBtn\').disabled=false;" />退货 ';
				html += '<input id="auditExchangeBtn" type="button" value="换货审核" disabled="disabled" onclick="Zhiwo.Order.auditExchange();" />&nbsp;';
				html += '<input id="auditReshipBtn" type="button" value="退货审核" disabled="disabled" onclick="Zhiwo.Order.auditReship();" />&nbsp;</li>';
			} else {
				html += '<li style="float:left;">';
				if (reshipInfo.refund_type == 'balance') {
					t = '退款到余额';
				} else if(reshipInfo.refund_type == 'original') {
					t = '退款到原路径';
				} else if (reshipInfo.refund_type == 'none') {
					t = '不退款';
				}
				html += '<input type="button" value="已审核通过(' + t + ')" disabled />&nbsp;</li>';
			}
			if (reshipInfo.goods_photo) {
				html += '<li style="float:left;padding: 3px 6px"><a href="http://images.zhiwo.com/'+reshipInfo.goods_photo+'" target="_blank">查看退货图片</a></li>';
			} else {
				html += '<li style="float:left;padding: 3px 6px">无退货图片</li>';
			}
			var taxHtml = '';
			var orderRefer = reshipInfo.order_refer;
			if (orderRefer.indexOf('sea') != -1)
			{
				taxHtml = '<tr><td align="right">退货税费金额:</td><td align="left">'+reshipInfo.tax_amount+'</td></tr>';
			}
			html += '</ul></div>';
			html += '<table width="100%"><tr><td align="center">'+
					'<table width="97%" style="border:1px solid #ccc; border-collapse:collapse;">'+
					'<thead><tr><td width="25%" height="23" valign="middle"><strong>退货信息</strong></td>'+
					'<td width="50%" height="23" valign="middle"><strong>退货商品</strong></td>'+
					'<td width="25%" height="23" valign="middle"><strong>退款人信息</strong></td></tr>'+
					'<tr><td colspan="3"><hr /></td></tr></thead>'+
					'<tbody><tr><td align="center"><table>'+
					'<tr><td align="right">退货单号:</td><td align="left">'+reshipInfo.item_id+'</td></tr>'+
					'<tr><td align="right">申请退货:</td><td align="left">'+reshipInfo.create_time+'</td></tr>'+
					'<tr><td align="right">退货状态:</td><td align="left">'+reshipInfo.item_status_str+'</td></tr>'+
					'<tr><td align="right">退货商品金额:</td><td align="left">'+reshipInfo.goods_amount+'</td></tr>'+
					taxHtml+
					'<tr><td align="right">优惠扣减:</td><td align="left">'+reshipInfo.coupon_amount+'</td></tr>'+
					'<tr><td align="right">应退运费:</td><td align="left">'+reshipInfo.return_freight+'</td></tr>'+
					'<tr><td align="right">应退总额:</td><td align="left">'+reshipInfo.final_amount+'</td></tr>'+
					'<tr><td align="right">退货原因:</td><td align="left">'+reshipInfo.return_reason+' '+reshipInfo.return_reason_other+'</td></tr>'+
					'</table></td><td align="center" valign="top"><table cellspacing="1" bgcolor="#a8c7ce">'+
					'<tr><td bgcolor="#ffffff">商品ID</td><td bgcolor="#ffffff">SKU</td><td bgcolor="#ffffff">商品名</td><td bgcolor="#ffffff">商品单价</td><td bgcolor="#ffffff">原单数量</td><td bgcolor="#ffffff">退货数量</td></tr>';
					for(var i=0;i<reshipInfo.goods.length;i++) {
						for(var j=0,k=reshipInfo.goods[i].skulist.length;j<k;j++) {
							html += '<tr>';
							if (j == 0) {
								html += '<td rowspan='+k+' bgcolor="#ffffff">'+reshipInfo.goods[i].goods_id+'</td>';
							}
							html += '<td bgcolor="#ffffff">'+reshipInfo.goods[i].skulist[j].sku+'</td>';
							if (j == 0) {
								html += '<td rowspan='+k+' bgcolor="#ffffff">'+reshipInfo.goods[i].name+'</td>';
								html += '<td rowspan='+k+' bgcolor="#ffffff">'+reshipInfo.goods[i].price+'</td>';
								html += '<td rowspan='+k+' bgcolor="#ffffff">'+reshipInfo.goods[i].old_quantity+'</td>';
								html += '<td rowspan='+k+' bgcolor="#ffffff">'+reshipInfo.goods[i].return_quantity+'</td>';
							}
							html += '</tr>';
						}
					}
					html += '</table><br /><table cellspacing="1" bgcolor="#a8c7ce">'+
					'<tr><td colspan="3" bgcolor="#ffffff"><strong>退货日志</strong></td></tr>'+
					'<tr><td bgcolor="#ffffff">操作人</td><td bgcolor="#ffffff">操作时间</td><td align="left" bgcolor="#ffffff">&nbsp; 操作说明</td></tr>';
					for(var i=0;i<reshipInfo.logs.length;i++) {
						html += '<tr><td align="left" bgcolor="#ffffff">'+reshipInfo.logs[i].op_user+'</td><td align="left" bgcolor="#ffffff">'+reshipInfo.logs[i].op_time+'</td><td align="left" bgcolor="#ffffff">'+reshipInfo.logs[i].op_content+'</td></tr>';
					}
					html += '</table></td><td align="center" valign="top"><table>'+
					'<tr><td align="right" style="width:50px;">UID:</td><td align="left" style="width:200px;">'+reshipInfo.member_id+'</td></tr>'+
					'<tr><td align="right">用户名:</td><td align="left">'+reshipInfo.member_name+'</td></tr>'+
					'<tr><td align="right">姓名:</td><td align="left">'+reshipInfo.contact_name+'</td></tr>'+
					'<tr><td align="right">电话:</td><td align="left">'+reshipInfo.contact_mobile+'</td></tr>'+
					'<tr><td align="right">地址:</td><td align="left">'+data.receive_addr+'</td></tr>'+
					'</table></td></tr>'+
					'</tbody></table></td></tr>'+
				'</table>';
		return html;
	},
	
	//修改的退货信息
	showReshipInfo:function(){
		var orderId = document.getElementById("reship_order_id").value;
		var url = '/transaction/order/ajax/reshipinfo?order_id='+orderId;
		$.get(url, function(rs) {
			var html = '';
			if (rs) {
				if (rs.status == 'SUCC') {
					var taxHtml = '';
					var orderRefer = rs.reshipInfo.order_refer;
					if (orderRefer.indexOf('sea') != -1)
					{
						taxHtml = '<tr><td width="15%" height="23" align="right">税费金额：</td><td width="85%" align="left">'+rs.reshipInfo.tax_amount+'</td></tr>';
					}
					html += '<form name="reshipForm" action="return false;">'+
					'<input name="order_id" type="hidden" value="'+rs.reshipInfo.order_id+'" />'+
					'<input name="item_id" type="hidden" value="'+rs.reshipInfo.item_id+'" />'+
					'<table width="100%"><tr><td align="left">&nbsp;&nbsp;<strong>修改退货信息</strong></td></tr><tr><td align="left">'+
					'<table width="97%" style="border:1px solid #ccc; border-collapse:collapse;">'+
					'<tr><td width="15%" height="23" align="right">源订单号：</td><td width="85%" align="left">'+rs.reshipInfo.order_id+'</td></tr>'+
					'<tr><td width="15%" height="23" align="right">退货单号：</td><td width="85%" align="left">'+rs.reshipInfo.item_id+'</td></tr>'+
					'<tr><td width="15%" height="23" align="right">商品金额：</td><td width="85%" align="left">'+rs.reshipInfo.goods_amount+'</td></tr>'+ taxHtml +
					'<tr><td width="15%" height="23" align="right">优惠扣减：</td><td width="85%" align="left">'+rs.reshipInfo.coupon_amount+'</td></tr>'+
					'<tr><td width="15%" height="23" align="right">寄回运费：</td><td width="85%" align="left"><input name="return_freight" size="10" value="'+rs.reshipInfo.return_freight+'" /></td></tr>'+
					'<tr><td width="15%" height="23" align="right">物流单号：</td><td width="85%" align="left"><input name="express_number" size="16" maxlength="20" value="'+rs.reshipInfo.delivery_number+'" /> (顾客寄回包裹的物流单号，只允许填写数字)</td></tr>'+
					'<tr><td width="15%" height="35" align="right">&nbsp;</td><td width="85%" align="left"><input name="submit" type="button" value="保存" onclick="Zhiwo.Order.updateReshipInfo();" />&nbsp;&nbsp;&nbsp;<input name="submit" type="reset" value="重置" /></td></tr>'+
					'</table></td></tr></table></form>';
					$("#detail_panel div[id=detail_area]").html(html);
				} else {
					$("#detail_area").html('无退货记录');
				}
			} else {
				$("#detail_area").html('Loading....');
			}
		});
	},
	
	//提交退货信息
	updateReshipInfo:function(){
		$.post(
			'/transaction/order/ajax/updatereship',
			'order_id='+document.reshipForm.order_id.value+'&item_id='+document.reshipForm.item_id.value+'&return_freight='+document.reshipForm.return_freight.value+'&express_number='+document.reshipForm.express_number.value,
			function(rs) {
				if (rs.status == 'SUCC') {
					alert('保存成功');
				} else {
					alert('保存失败');
				}
			}
		);
	},

	//退货审核
	auditReship: function(){
		if(!confirm("确定通过退货审核吗？")) {
			return false;
		}
		var orderId = document.getElementById("reship_order_id").value;
		var url = '/transaction/order/ajax/auditreship?order_id=' + orderId;
		$.get(url, function(rs) {
			if (rs.status == 'SUCC') {
				alert('操作成功');
				$('#auditReshipBtn').attr('disabled', true);
			} else {
				alert('操作失败');
			}
		});
	},
	
	//换货审核
	auditExchange: function(){
		if(!confirm("确定通过换货审核吗？")) {
			return false;
		}
		var orderId = document.getElementById("reship_order_id").value;
		var url = '/transaction/order/ajax/auditExchange?order_id=' + orderId;
		$.get(url, function(rs) {
			if (rs.status == 'SUCC') {
				alert('操作成功');
				$('#auditExchangeBtn').attr('disabled', true);
			} else {
				alert('操作失败');
			}
		});
	},
	//取消退货
	cancelReship:function(){
		if(!confirm("您确定要取消退货吗？")) {
			return false;
		}
		var orderId = document.getElementById("reship_order_id").value;
		var url = '/transaction/order/ajax/cancelreship?order_id=' + orderId;
		$.get(url, function(rs) {
			if (rs.status == 'SUCC') {
				alert('操作成功');
			} else {
				alert('操作失败');
			}
		});
	},
	
	checkReturnGoods : function(obj,num)
	{
		var inputnum = parseInt(obj.value);
		var buynum = parseInt(num);
		if(inputnum < 0 || inputnum > buynum) {
			obj.value = '0';
			alert('输入的退货数不正确');
			return false;
		}
	   
		var flag = 0;
		var returnObj = $("#detail_area input[id=returnnums]");
		var temp_num = 0;
		for (var i=0;i<returnObj.length;i++) {
			if(parseInt(returnObj[i].value) > 0) {
				$("#detail_area input[id=returnConfirm]").show();
				return true;
			}
		}
		if(flag == 0) {
			$("#detail_area input[id=returnConfirm]").hide();
		}
	},
	
	changeTab: function(){
		$("li[to=go]").each(function(){				 
			$(this).bind("click", function(){
				location.href = "/transaction/order/list?tabtype=" + $(this).attr("id");				
			});						 
		});	
	},
	initTab: function(){
		var mid = Zhiwo.Order.cuurtab;
		if (mid != '') {
			$("li[id="+ mid +"]").attr("class","hovertab");
		}
	},
	initEasyBt: function(){
		$("span[id=easybt]").each(function(){
			$(this).bind("mouseover",function(){
				$(this).children("#showpanel").show();
			});
			$(this).bind("mouseout",function(){
				Zhiwo.Order.hideEasyBt();
			});
		});
		$("a[id=showremark]").each(function(){
			$(this).bind("click",function(){
				Zhiwo.Order.showRemark = 1;
				var mid = $(this).attr("tid");
				$("#row_"+mid).find("#view_detail").click();
			});
		});
	},
	hideEasyBt: function(){
		$("div[id=showpanel]").hide();
	}
}
