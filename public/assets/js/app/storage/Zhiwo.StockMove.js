/**
 * 知我移仓操作
 * author cj
 * date 2012/7/9
 */
if(!window.Zhiwo)
{
	window.Zhiwo = new Object();
}

Zhiwo.StockMove = {
	isConfirm : 0,					//判断动作是否成功
	chooseProductButton : 'show',	//控制选择货品按钮·
	house : '-1',					//当前选择的移出仓库
	choosedProduct : [],
	isLoading : false,

	/*-------------------- 初始化页面动作 ----------------------------------------*/
	init : function() {
		$("form[name=searchMoveList] input[name=beginTime]").calendar({dateFormat: 'YMD-',timeSeparators: [' ']});
		$("form[name=searchMoveList] input[name=endTime]").calendar({dateFormat: 'YMD-',timeSeparators: [' ']});
		$("#addMoveList").bind("click", Zhiwo.StockMove.openWindow);
		$("a[id=dealMoveList]").bind("click", Zhiwo.StockMove.openWindow);
	},

	/*----------------------- 移仓单 创建, 审核, 出库, 入库, 删除, 编辑 所有窗口---*/
	openWindow : function() {
		var act = $(this).attr("act");
		var moveId = $(this).attr("move_id");
		var title = '';
		var yesbtn = '';
		var url = '';

		switch(act) {
			case 'create':
				title = '新增移仓单';
				yesbtn = '确定';
				url = '/storage/move/create';
				yesFunction = Zhiwo.StockMove.createMoveList;
				Zhiwo.StockMove.chooseProductButton = 'show';
			break;
			case 'edit':
				title = '编辑' + moveId + '号移仓单 业务时间:' + $(this).attr('recordTime');
				yesbtn = '修改';
				url = '/storage/move/create?action=edit&move_id=' + moveId;
				Zhiwo.StockMove.chooseProductButton = 'show';
				yesFunction = Zhiwo.StockMove.editMoveList;
			break;
			case 'view':
				title = '查看' + moveId + '号移仓单';
				yesbtn = '返回';
				url = '/storage/move/checkmovelist?move_id=' + moveId + '&action=view';
				Zhiwo.StockMove.chooseProductButton = 'hide';
				yesFunction = function(){return true;};
				Zhiwo.StockMove.isConfirm = 1;
			break;
			case 'delete':
				title = '删除' + moveId + '号移仓单';
				yesbtn = '删除';
				url = '/storage/move/checkmovelist?move_id=' + moveId + '&action=delete';
				Zhiwo.StockMove.chooseProductButton = 'hide';
				yesFunction = Zhiwo.StockMove.delMoveList;
			break;
			case '0':
				title = '审核' + moveId + '号移仓单';
				yesbtn = '审核';
				url = '/storage/move/checkmovelist?move_id=' + moveId;
				Zhiwo.StockMove.chooseProductButton = 'hide';
				yesFunction = Zhiwo.StockMove.checkMoveList;
			break;
			case '1':
				title = moveId + '号移仓单货品移出';
				yesbtn = '移出';
				url = '/storage/move/checkmovelist?move_id=' + moveId + '&action=send';
				Zhiwo.StockMove.chooseProductButton = 'hide';
				yesFunction = Zhiwo.StockMove.sendProducts;
			break;
			case '2':
				title = moveId + '号移仓单货品移入';
				yesbtn = '移入';
				url = '/storage/move/checkmovelist?move_id=' + moveId + '&action=put';
				Zhiwo.StockMove.chooseProductButton = 'hide';
				yesFunction = Zhiwo.StockMove.putProductsInHouse;
			break;
			case 'scrapped_turn_good':
				title = moveId + '号移仓单申请残品转良';
				yesbtn = '确定';
				url = '/storage/move/applyback?move_id=' + moveId + '&action=scrapped_turn_good';
				Zhiwo.StockMove.chooseProductButton = 'hide';
				yesFunction = Zhiwo.StockMove.applyTurnGood;
			break;
			case 'sample_back_stock':
				title = moveId + '号移仓单申请样品归库';
				yesbtn = '确定';
				url = '/storage/move/applyback?move_id=' + moveId + '&action=sample_back_stock';
				Zhiwo.StockMove.chooseProductButton = 'hide';
				yesFunction = Zhiwo.StockMove.applyBackStock;
			break;
		}

		var dialog = KindEditor.dialog({
			width : 800,
			title : title,
			body  : '<div id="add_moveList"><iframe id="frame_moveList" style="width:100%;height:400px;border:none;"></iframe></div>',
			closeBtn : {
				name: "关闭",
				click : function(e){
					Zhiwo.StockMove.productMoveInit();
					dialog.remove();
				}
			},
			yesBtn : {
				name: yesbtn,
				click : function(e) {
					var error = $("#add_moveList iframe[id=frame_moveList]").contents().find("span[id=errorMsg]");
					error.html('正在提交中，请稍后...');
					error.css('color', 'blue');
					//$(".ke-dialog input[value="+ yesbtn +"]").attr("disabled", true); //禁用提交按钮
					var done = yesFunction();
					if(Zhiwo.StockMove.isConfirm == 1) {
						Zhiwo.StockMove.productMoveInit();
						dialog.remove();
						location.href = location.href;
					}
				}
			},
			noBtn : {
				name: '取消',
				click : function(e) {
					Zhiwo.StockMove.productMoveInit();
					dialog.remove();
				}
			}
		}); 

		$("#add_moveList iframe[id=frame_moveList]").attr("src", url);
	},

	/*----------------------创建移仓单 提交方法 ------------------------------------*/
	createMoveList : function(e) {
		var quantity = $("#add_moveList iframe[id=frame_moveList]").contents().find("input[id=quantity]");
		quantity.each(Zhiwo.StockMove.checkQuantity);
		if(Zhiwo.StockMove.isConfirm == 1) {
			$(".ke-dialog input[value=返回]").attr("disabled", false);
			return true;
		} else if(Zhiwo.StockMove.isConfirm == -1) {
			Zhiwo.StockMove.isConfirm = 0;
		} else {
			Zhiwo.StockMove.productMoveInit();
			$("#add_moveList iframe[id=frame_moveList]").contents().find("#frame_moveList_form input[name=submit]").trigger("click");
		}
	},

	/*----------------------------编辑移仓单 -----------------------------------------*/
	editMoveList : function() {
		if(Zhiwo.StockMove.isConfirm != 1) {
			var quantity = $("#add_moveList iframe[id=frame_moveList]").contents().find("input[id=quantity]");
			quantity.each(Zhiwo.StockMove.checkQuantity);
			if(Zhiwo.StockMove.isConfirm == -1) {
				Zhiwo.StockMove.isConfirm = 0;
			} else {
				Zhiwo.StockMove.productMoveInit();
				$("#add_moveList iframe[id=frame_moveList]").contents().find("#frame_moveList_form input[name=submit]").trigger("click");
			}
		}
		$(".ke-dialog input[value=修改]").attr("disabled", false);
	},

	/*----------------------------申请残品转良 -----------------------------------------*/
	applyTurnGood : function() {
		if(Zhiwo.StockMove.isConfirm != 1) {
			var moveObj = $("#add_moveList iframe[id=frame_moveList]").contents();
			var quantity = moveObj.find("input[id=quantity]");
			quantity.each(Zhiwo.StockMove.checkQuantity);
			if(Zhiwo.StockMove.isConfirm == -1) {
				Zhiwo.StockMove.isConfirm = 0;
			} else {
				moveObj.find("#frame_moveList_form input[name=submit]").trigger("click");
			}
		}
	},

	/*----------------------------申请样品归库 -----------------------------------------*/
	applyBackStock : function() {
		if(Zhiwo.StockMove.isConfirm != 1) {
			var moveObj = $("#add_moveList iframe[id=frame_moveList]").contents();
			var quantity = moveObj.find("input[id=quantity]");
			quantity.each(Zhiwo.StockMove.checkQuantity);
			if(Zhiwo.StockMove.isConfirm == -1) {
				Zhiwo.StockMove.isConfirm = 0;
			} else {
				moveObj.find("#frame_moveList_form input[name=submit]").trigger("click");
			}
		}
	},

	/*-------------------------删除一个未审核的移仓单---------------------------------*/
	delMoveList : function() {
		if(Zhiwo.StockMove.isConfirm != 1) {
			var moveObj = $("#add_moveList iframe[id=frame_moveList]").contents();
			var moveId = moveObj.find("#move_id").val();
			if(confirm("你确定要删除" + moveId + "号移仓单吗？")) {

				var error = moveObj.find("span[id=errorMsg]");

				if(Zhiwo.StockMove.checkAjaxLoading()){

					error.html("请求已发送，请稍等");
					return false;
				}

				Zhiwo.StockMove.setAjaxLoading();

				$.post('/storage/move/checkmovelist', {move_id:moveId, action:'delete'}, function(data) {

					Zhiwo.StockMove.clearAjaxLoading();

					if(data == '0') {
						error.html("删除成功!");
						error.css("color", "blue");
						Zhiwo.StockMove.isConfirm = 1;
						$(".ke-dialog input[value=删除]").attr("disabled", false);
						$(".ke-dialog input[value=删除]").val('返回');
					} else {
						error.html("删除失败!");
					}
				});
			}
		}
	},
	
	/*-------------------------审核移仓单方法----------------------------------------*/
	checkMoveList : function() {
		if(Zhiwo.StockMove.isConfirm != 1) {
			var moveObj = $("#add_moveList iframe[id=frame_moveList]").contents();
			var moveId = moveObj.find("#move_id").val();
			var remarks = moveObj.find("textarea[id=remarks]").val();

			var error = moveObj.find("span[id=errorMsg]");

			if(Zhiwo.StockMove.checkAjaxLoading()){

				error.html("请求已发送，请稍等");
				return false;
			}

			Zhiwo.StockMove.setAjaxLoading();

			$.post('/storage/move/checkmovelist', {move_id:moveId, remarks:remarks, action:'check'}, function(data) {

				Zhiwo.StockMove.clearAjaxLoading();

				if(data == '0') {
					error.html("审核成功!");
					error.css("color", "blue");
					Zhiwo.StockMove.isConfirm = 1;
					$(".ke-dialog input[value=审核]").attr("disabled", false);
					$(".ke-dialog input[value=审核]").val('返回');
				} else {
					error.html("审核失败!");
				}
			});
		}
	},

	/*--------------------------- 移仓单货品移出 -------------------------------*/
	sendProducts : function() {
		var moveObj = $("#add_moveList iframe[id=frame_moveList]").contents();
		var moveId = moveObj.find("#move_id").val();
		var moveType = moveObj.find("select[name=moveType]").val();
		var house = moveObj.find("select[name=outHouseCode]").val();
		var logisticsCompany = moveObj.find("input[name=logisticsCompany]").val();
		var logisticsId = moveObj.find("input[name=logisticsId]").val();
		var param = {move_id:moveId, move_type:moveType, action:'send', house:house, logistics_company:logisticsCompany, logistics_id:logisticsId};

		if(Zhiwo.StockMove.isConfirm != 1) {

			var error = moveObj.find("span[id=errorMsg]");

			if(Zhiwo.StockMove.checkAjaxLoading()){

				error.html("请求已发送，请稍等");
				return false;
			}

			Zhiwo.StockMove.setAjaxLoading();

			$.post('/storage/move/checkmovelist', param, function(data){

				Zhiwo.StockMove.clearAjaxLoading();

				if(data == '0') {
					error.html("移出成功");
					error.css("color", "blue");
					Zhiwo.StockMove.isConfirm = 1;
					$(".ke-dialog input[value=移出]").attr("disabled", false);
					$(".ke-dialog input[value=移出]").val('返回');
				} else {
					error.html("移出失败:"+data);
				}
			});
		}
	},

	/*---------------------移仓单货品移入 ---------------------------------------*/
	putProductsInHouse : function () {
		var moveObj = $("#add_moveList iframe[id=frame_moveList]").contents();
		var moveId = moveObj.find("#move_id").val();
		var house = moveObj.find("select[name=inHouseCode]").val();
		var moveType = moveObj.find("select[name=moveType]").val();
		var param = {move_id:moveId, move_type:moveType, house:house, action:'put'};
		if(Zhiwo.StockMove.isConfirm != 1) {

			var error = moveObj.find("span[id=errorMsg]");

			if(Zhiwo.StockMove.checkAjaxLoading()){

				error.html("请求已发送，请稍等");
				return false;
			}

			Zhiwo.StockMove.setAjaxLoading();

			$.post('/storage/move/checkmovelist', param, function(data) {

				Zhiwo.StockMove.clearAjaxLoading();

				if(data == '0') {
					error.html("移入成功");
					error.css("color", "blue");
					Zhiwo.StockMove.isConfirm = 1;
					$(".ke-dialog input[value=移入]").attr("disabled", false);
					$(".ke-dialog input[value=移入]").val('返回');
				} else {
					error.html("移入失败:"+data);
				}
			});
		}
	},

	/*-----------------------------选货品窗口----------------------------------*/
	chooseProduct : function() {
		var moveType = $("#add_moveList iframe[id=frame_moveList]").contents().find("select[name=moveType]").val();
		if(moveType == "-1") {
			alert("请选择移仓类型");
			return false;
		}
		var houseCodeAndType = $("#add_moveList iframe[id=frame_moveList]").contents().find("select[name=outHouseCodeAndType]").val();
		if(houseCodeAndType == "-1") {
			alert("请选择移出仓库");
			return false;
		}
		var arr = new Array();
		arr = houseCodeAndType.split("_");
		Zhiwo.StockMove.house = arr[0];
	
		$(".ke-dialog").first().hide();
		var dialog = KindEditor.dialog({
			width : 800,
			title : "选择商品",
			 body : '<div id="add_chooseProduct"><iframe id="frame_chooseProduct" style="width:100%;height:400px;border:none;"></iframe></div>',
			closeBtn : {
				name : "关闭",
				click : function(e) {
				$(".ke-dialog").first().show();
					dialog.remove();
					Zhiwo.StockMove.isConfirm = 0;
				}
			},
			yesBtn : {
				name : "确定", 
				click : function(e) {
					if(Zhiwo.StockMove.isConfirm == 1) {
						$(".ke-dialog").first().show();
						dialog.remove();
						Zhiwo.StockMove.isConfirm = 0;
						var delProduct = $("#add_moveList iframe[id=frame_moveList]").contents().find("#delProduct");
						delProduct.unbind("click", Zhiwo.StockMove.delProduct);
						delProduct.bind("click", Zhiwo.StockMove.delProduct);
					} else {
						alert("请选择货品!");
					}
				}
			},
			noBtn : {
				name : "取消", 
				click : function(e) {
					$(".ke-dialog").first().show();
					dialog.remove();
					Zhiwo.StockMove.isConfirm = 0;
				}
			}
		});
		$("#add_chooseProduct iframe[id=frame_chooseProduct]").attr("src", "/storage/move/searchproducts");
	},

	/*-------------------------  重置productMove状态 -------------------------------*/
	productMoveInit : function() {
		Zhiwo.StockMove.isConfirm = 0;
		Zhiwo.StockMove.chooseProductButton = "show";
		Zhiwo.StockMove.house = '-1';
		Zhiwo.StockMove.choosedProduct = [];
	}, 

	/*--------------------- 添加一个货品到移仓单-------------------------------------*/
	addProduct : function() {
		var index = Zhiwo.StockMove.choosedProduct.length;
		var inArray = $.inArray($(this).val(), Zhiwo.StockMove.choosedProduct);
		if(inArray == -1) {
			Zhiwo.StockMove.choosedProduct.push($(this).val());
			var addRow = '<tr><td>' + (index + 1) + '</td>';
			addRow += '<td>' + $(this).val() + '</td><td>' + $(this).attr("pname") + '</td><td>' + $(this).attr("stock") + '</td>';
			addRow += '<td><input type="text" id="quantity" name="products[' + $(this).val() + ']" pname="'+$(this).attr("pname")+'" ';
			addRow += ' stock="' + $(this).attr("stock")+ '" value="0" maxlength="4" size="4" /></td>';
			addRow += '<td><a id="delProduct" href="javascript:void(0);" sku="' + $(this).val() + '">删除</a></td></tr>';
			$("#add_moveList iframe[id=frame_moveList]").contents().find("table[id=choosedProduct]").append(addRow);
		}
		Zhiwo.StockMove.isConfirm = 1;
		var checked = $(this).attr("checked");
		if(checked == false) {
			var del = $("#add_moveList iframe[id=frame_moveList]").contents().find("a[sku=" + $(this).val() + "]");
			del.trigger("click");
		}
	},

	/*------------------从移仓单中的货品中删除一个货品-------------------------------*/
	delProduct : function() {
		var value = $(this).attr("sku");
		var choosed = Zhiwo.StockMove.choosedProduct;
		var index = $.inArray(value, choosed);
		choosed.splice(index, 1);
		$(this).parent().parent().remove();
	},

	/*--------------------验证移仓数量 ----------------------------------------------*/
	checkQuantity : function() {
		var error = $("#add_moveList iframe[id=frame_moveList]").contents().find("span[id=errorMsg]");
		var number = parseInt($(this).val());
		if(isNaN(number)) {
			Zhiwo.StockMove.isConfirm = -1;
			error.html("请输入'" + $(this).attr("pname") + "'正确的数量");
		}

		if(number > parseInt($(this).attr("stock"))) {
			Zhiwo.StockMove.isConfirm = -1;
			error.html("货品'" + $(this).attr("pname") + "'的出库数量超过了实际库存!");
		}
	},

	/**
	 * 检查是否有Ajax正在提交
	 * @return 	bool 	true表示有，false表示没有
	 */
	checkAjaxLoading : function(){

		return Zhiwo.StockMove.isLoading;
	},

	/**
	 * 设置Ajax正在提交
	 * @return 	void
	 */
	setAjaxLoading : function(){

		Zhiwo.StockMove.isLoading = true;
	},

	/**
	 * 清除Ajax正在提交的标志
	 * @return 	void
	 */
	clearAjaxLoading : function(){

		Zhiwo.StockMove.isLoading = false;
	},
};

$(function(){
	Zhiwo.StockMove.init();
});