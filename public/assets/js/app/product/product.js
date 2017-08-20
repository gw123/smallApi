if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};
Zhiwo.product = {
	currlevel: 0,
	currCatid: 0,
	sortid: 0,
	catpath: '',
	catpathObj: [],
	typeid: 0,
	brandid: 0,
	searchtype: '',
	tab: 'tab_all',
	init: function() {
		$("#htm_cat_0").bind('change', function(){
				var midlevel = $("#htm_cat_0").attr('sid');
				Zhiwo.product.currlevel = parseInt(midlevel);
				var catid = $("#htm_cat_0").val();
				Zhiwo.product.clearPlan();
				if (catid != 0) {
					Zhiwo.product.currCatid = catid;
					Zhiwo.product.getKidSelect();
				}
			});
	},
	clearPlan: function() {
		var currlevel = Zhiwo.product.currlevel;
		$("#htm_cat_plan_"+currlevel).html('');
		var mid =  $("#htm_cat_" + currlevel).val();
		$("#htm_cat").val(mid);
	},
	getKidSelect: function() {
		var currlevel = Zhiwo.product.currlevel;
		var nextlevel = currlevel + 1;
		//plan_0 plan_1 plan_2 plan_3		
		//get pos-list of house to format html-plan-select
		$.getJSON('/product/goodssort/list',{pid:Zhiwo.product.currCatid}, function(data){
				if (data != null) {
					var midPosPlan = '<select id="htm_cat_'+nextlevel+'" sid="'+nextlevel+'"  style="float:left">';
					midPosPlan += '<option value="0">子分类</option>';	
					$.each(data,function(i,item){
						midPosPlan += '<option value="' + item.cat_id + '">' + item.cat_name + '</option>';	
					});
					midPosPlan += '</select><div id="htm_cat_plan_'+nextlevel+'"  style="float:left"></div>';					
					$("#htm_cat_plan_"+currlevel).html(midPosPlan);
					$("#htm_cat_"+nextlevel).bind("change", function(){
							var midlevel = $("#htm_cat_"+nextlevel).attr('sid');
							Zhiwo.product.currlevel = parseInt(midlevel);
							var catid = $("#htm_cat_"+nextlevel).val();
							Zhiwo.product.clearPlan();
							if (catid != 0) {
								Zhiwo.product.currCatid = catid;
								Zhiwo.product.getKidSelect();
							}
						});
					if (Zhiwo.product.catpathObj.length > 0) {
						var mid = Zhiwo.product.catpathObj.pop();
						$("#htm_cat_" + nextlevel).val(mid);
						$("#htm_cat_" + nextlevel).change();
					}
				}
			});
	},
	editinit: function() {
		$("#htm_brand").val(Zhiwo.product.brandid);
		$("#htm_type").val(Zhiwo.product.typeid);
		Zhiwo.product.init();
		var levelarr = Zhiwo.product.catpath.split(',');
		if (levelarr.length > 0 ) {
			Zhiwo.product.catpathObj = levelarr;
			var mid = Zhiwo.product.catpathObj.pop();
			$("#htm_cat_" + Zhiwo.product.currlevel).val(mid);
			$("#htm_cat_" + Zhiwo.product.currlevel).change();
		}
	}
}