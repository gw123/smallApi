if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};
Zhiwo.brand = {
	init: function() {
		Zhiwo.brand.addbrandinit();
		Zhiwo.brand.delbrandinit();
		Zhiwo.brand.boxallinit();
	},
	addbrandinit: function() {
		$("#addbrand").bind("click", function(){
			Zhiwo.brand.addbrandClick();
		}); 		
	},
	addbrandClick: function() {
		window.location.href = "/product/brand/add";
	},
	delbrandinit: function() {
		$("#delbrand").bind("click", function(){
			Zhiwo.brand.delbrandClick();
		}); 		
	},
    delbrandClick: function() {
		var brandlist = new Array();
		$('input:checkbox[name=brandList][checked]').each(function(){
			 	brandlist.push($(this).val());
		}); 
		var params = brandlist.toString();
		if(params != '') {
			$.post("/product/brand/del", {s:params}, function(){
						window.location.href = window.location.href;
				}); 	
		}
	},
	boxallinit: function() {
		$("#boxall").bind("click", function(){
			Zhiwo.brand.boxallChange();
		}); 		
	},
	boxallChange: function() {
		var status = $("#boxall").attr("checked");
		if (status) {
			$("input:checkbox[name=brandList]").each(function(){
			 	$(this).attr("checked",true);
			 }); 
		} else {
			$("input:checkbox[name=brandList]").each(function(){
			 	$(this).attr("checked",false);
			 }); 			
		}
	},
	navigateinit: function(numPage, brandCount, currPage) {//每页行数, 总数, 当前页数
		var totalpage = brandCount / numPage;
		var startpage = currPage - 2;
		var endpage = currPage + 2;
		var navigatehtml = "";
		navigatehtml += '<a href="/product/brand?currpage=1">&lt;&lt;</a>&nbsp;';
		for(startpage; startpage<=endpage; startpage++){
			navigatehtml += '<a href="/product/brand?currpage=' + startpage + '">' + startpage + '</a>&nbsp;';
		}
		navigatehtml += '<a href="/product/brand?currpage=' + totalpage + '">&gt;&gt;</a>&nbsp;';
		$('.navigatediv').html(navigatehtml);
	}
}