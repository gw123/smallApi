if (!window.Zhiwo) {
	window.Zhiwo = new Object();
};
Zhiwo.GoodsImages = {
	imageDialog : null,
	itemId : null,
	browseImages: function(goodsId,type,itemId) {
		var imageType = [''];
		var typeOptions = '<option value="group_big">团购大图</option><option value="group_small">团购小图</option><option value="group_top">app团购主推图</option><option value="group_main">团购主图</option><option value="app" selected>合作图片</option>';
		var dialogBody = '<div style="margin:5px; padding:2px;">'+
						'<div id="imagesMenu"><form name="imageUpload" action="/image/goods/upload" method="post" target="uploadFrame" encType="multipart/form-data">'+
						'<input name="goods_id" id="goodsId" type="hidden" value="'+goodsId+'" />'+
						'图片类别 <select name="image_type" id="imageType" onchange="Zhiwo.GoodsImages.getImages(0,8);">'+typeOptions+'</select>&nbsp;&nbsp;|&nbsp;&nbsp;'+
						'上传新图：<input type="file" name="pic" size="30" />&nbsp; <input type="submit" value="确定" /></form>'+
						'<iframe id="uploadFrame" name="uploadFrame" src="about:blank" marginWidth=0 frameBorder=0 width=0 height=0></iframe>'+
						'</div><div id="imagesList" style="width:680px;"></div><div id="pageList" style="padding-top:5px;"></div>'+
						'</div>';
		var dialog = KindEditor.dialog({
			width : 700,
			height : 500,
			title : '选择商品图片 (商品ID:'+goodsId+')',
			body : dialogBody,
			closeBtn : {
				name : '关闭',
				click : function(e) {
					dialog.remove();
				}
			}
		});
		this.imageDialog = dialog;
		this.itemId = itemId;
		Zhiwo.GoodsImages.setSelectValue('imageType', type);
		Zhiwo.GoodsImages.getImages(0, 8);
	},
	
	getImages : function(offset, size) {
		$('#imagesList').html('loading...');
		var goodsId = $('#goodsId').val();
		var imageType = Zhiwo.GoodsImages.getSelectValue('imageType');
		var url = '/image/goods/browse?goods_id='+goodsId+'&image_type='+imageType+'&offset='+offset+'&size='+size+'&rand='+Math.random();
		$.get(url, function(res){
			if(res.total > 0) {
				var html = '<ul style="margin:0px; padding:0px; list-style:none;">';
				for(var i = 0; i < res.rows.length; i++){
					html += '<li style="float:left; width:160px;"><a href="#" onclick=Zhiwo.GoodsImages.selectImage("'+res.rows[i].url+'");><img src="'+res.rows[i].url+'" width="150" border="0" alt="'+res.rows[i].name+'" /></a>'+
					'<br />'+res.rows[i].width+'*'+res.rows[i].height+'</li>';
				}
				html += '</ul>';
				$('#imagesList').html(html);

				//分页
				if(res.total > 8) {
					var pageTotal = Math.ceil(res.total / size); //总页数
					var page = Math.floor(offset / size) + 1;
					var pageList = '&nbsp;&nbsp;总计'+res.total+'张&nbsp;&nbsp;';
					for(var i = 1; i <= pageTotal; i++) {
						if(page == i) {
							pageList += '<font color="red">'+i+'</font>&nbsp;&nbsp;';
						} else {
							offset = (i - 1) * size;
							pageList += '<a href="#" onclick="this.blur();Zhiwo.GoodsImages.getImages('+offset+','+size+');return false;">'+i+'</a>&nbsp;&nbsp;';
						}
					}
					$('#pageList').html(pageList);
				}
			}
			else
			{
				$('#imagesList').html('<br /><strong>还未上传此类别商品图片</strong>');
			}
		});
	},

	selectImage : function(imgUrl) {
		document.getElementById(this.itemId).value = imgUrl;
		document.getElementById(this.itemId+'_tips').src = imgUrl;
		this.imageDialog.remove();
	},

	setSelectValue : function(name, value) {
		//document.getElementById(name).value = value;
		var obj = document.getElementById(name);
		for (var i = 0; i < obj.length; i++) {
			if(obj[i].value == value) {
				obj[i].selected = true;
				return true;
			} 
		}
		return false;
	},
	
	getSelectValue : function(name) {
		var obj = document.getElementById(name);
		for (var i = 0; i < obj.length; i++) {
			if(obj[i].selected == true) {
				return obj[i].value;
			} 
		}
		return '';
	}
}