if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};
Zhiwo.Product = {
	prerow:null,
	stockurl:'/product/ajax/stock',
	init: function() {
		$("a[id=view_detail]").each(function(){
			$(this).bind("click",function(){
				var rowid = $(this).attr("pid");
				if(rowid != null && rowid != Zhiwo.Product.prerow){
					$("#detail_panel").remove();
					$(Zhiwo.Product.getDetailHtml()).insertAfter("#row_"+ rowid);
					$.getJSON(Zhiwo.Product.stockurl+'?sku='+$(this).attr("sku")+'&random='+ Math.random(), function(data){
						if (data.total==0){
							$("#detail_panel div[id=detail_content]").html('未查询到货品库存信息！可能没有入过库！');
						}else{
							Zhiwo.Product.showStockList(data.rows);
						}
					});
				}
				Zhiwo.Product.prerow = rowid;
			});
		});
	},
	getDetailHtml:function(){
		var html = $("#dpanel").html();
		html ='<tr id="detail_panel"><td colspan="11" bgcolor="#FFFFFF">'+html+'</td></tr>';
		return html;
	},
	showStockList:function(data){
		var html = '<table width="950"><tr><td width="100">sku</td><td width="100">仓库</td>'+'<td width="100">实际库存</td><td width="100">虚拟库存</td><td width="100">剩余库存</td>'+
				'<td width="120">最近入库价</td><td width="120">建仓时间</td><td width="120">最近入库时间</td></tr>';
		for(var i=0; i<data.length; i++)
		{
			html += '<tr><td>'+data[i].sku+'</td><td>'+data[i].house_name+'</td><td>'+data[i].real_stock+'</td><td>'+data[i].virtual_stock+'</td><td>'+data[i].left_stock+'</td><td>'+data[i].cost_price+'</td><td>'+data[i].create_time+'</td><td>'+data[i].last_modify+'</td></tr>';
		}
		html += '</table>';
		$("#detail_panel div[id=detail_content]").html(html);
	}
}