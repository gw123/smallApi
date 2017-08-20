/**
 * @author 	liuhaitao  20160319
 */


if(!window.Zhiwo)
{
	window.Zhiwo = new Object();
}
if(typeof runAction == "undefined" || typeof runAction == "null")
{
    window.runAction = false;
}

Zhiwo.VdianArticle = {

	bigImageArea : null,
	selectBigImgButton : null,
	articleEditorSelector : null,
	goodsIdSelector : null,
	articleTagSelector : null,

	init : function (){

		Zhiwo.VdianArticle.articleEditorSelector.select2({
			ajax: {
				url: "/marketing/cpubusinessv2/editorlist",
				dataType: 'json',
				delay: 1000,
				data: function (params) {
					return {
						search_editor_name: params.term, // search term
						offset: 0,
						size: 20,
						is_ajax: '1',
						publish_count: '1'
					};
				},
				processResults: function (data, params) {

					params.page = params.page || 1;

					var tmp = new Array();

					if(data.total > 0){

						for(var i in data.rows){

							tmp.push({
								'id': data.rows[i].id,
								'text': data.rows[i].editor_name,
								'avatar': data.rows[i].editor_avatar,
								'publish_count': data.rows[i].publish_count
							});
						}
					}

					return {
						results: tmp,
						pagination: {
							more: false
						}
					};
				},
				cache: true
			},
			escapeMarkup: function (markup) { return markup; },
			templateResult: Zhiwo.VdianArticle.formatRepoEditor,
			templateSelection: Zhiwo.VdianArticle.formatRepoSelectionEditor,
			// debug: true,
			language: 'zh-CN'
		});

		Zhiwo.VdianArticle.initGoodsSelect2();

		Zhiwo.VdianArticle.articleTagSelector.select2({
			ajax: {
				url: "/marketing/cpubusinessv2/taglist",
				dataType: 'json',
				delay: 1000,
				data: function (params) {
					return {
						search_tag_name: params.term, // search term
						offset: 0,
						size: 20,
						is_ajax: '1'
					};
				},
				processResults: function (data, params) {

					params.page = params.page || 1;

					var tmp = new Array();

					if(data.total > 0){

						for(var i in data.rows){

							tmp.push({
								'id': data.rows[i].id,
								'text': data.rows[i].tag_name
							});
						}
					}

					return {
						results: tmp,
						pagination: {
							more: false
						}
					};
				},
				cache: true
			},
			escapeMarkup: function (markup) { return markup; },
			templateResult: Zhiwo.VdianArticle.formatRepoTag,
			templateSelection: Zhiwo.VdianArticle.formatRepoSelectionTag,
			// debug: true,
			language: 'zh-CN',
			placeholder: '请选择'
		});

		Zhiwo.VdianArticle.bigImageArea.delegate('a[name="del_article_big_image"]', 'click', function(e){

			var mySelf = $(this);

			mySelf.parent().remove();
		});

		Zhiwo.VdianArticle.bigImageArea.delegate('img[name="article_big_image"]', 'click', function(e){

			var mySelf = $(this);

			Zhiwo.VdianArticle.updateTagPosition(mySelf, e.pageX, e.pageY);
		});

		$(".calendar").calendar({});
	},

	initGoodsSelect2 : function (){

		Zhiwo.VdianArticle.goodsIdSelector.select2({
			ajax: {
				url: "/marketing/cpubusinessv2/selectgoods",
				dataType: 'json',
				delay: 1000,
				data: function (params) {
					return {
						search_word: params.term,
						is_ajax: '1'
					};
				},
				processResults: function (data, params) {

					params.page = params.page || 1;

					var tmp = new Array();
					var row = null;

					if(data.total > 0){

						for(var i in data.rows){

							row = data.rows[i];

							tmp.push({
								'id': row.goods_id,
								'text': row.name,
								'sales_channel': row.format_sales_channel,
								'cost_price': row.merge_sku.cost_price,
								'price': row.price,
								'group_price': row.group_price,
								'brand_name': row.merge_sku.brand_name.join(','),
								'type': row.merge_sku.type.join(','),
								'sort': row.merge_sku.sort.join(',')
							});
						}
					}

					return {
						results: tmp,
						pagination: {
							more: false
						}
					};
				},
				cache: true
			},
			escapeMarkup: function (markup) { return markup; },
			templateResult: Zhiwo.VdianArticle.formatRepoGoods,
			templateSelection: Zhiwo.VdianArticle.formatRepoSelectionGoods,
			minimumInputLength: 1,
			// debug: true,
			language: 'zh-CN',
			placeholder: '请选择'
		});
	},

	checkForm : function(objForm){

		if(!Zhiwo.VdianArticle.articleEditorSelector.val()){

			alert('请选择文章发布者');
			return false;
		}

		if(!Zhiwo.VdianArticle.goodsIdSelector.val()){

			alert('请选择关联商品');
			return false;
		}

		var tmp = $('input[name="nice_count"]').val();

		if(tmp && !(/^[0-9]+$/.test(tmp))){

			alert('点赞计数格式错误，请输入正整数');
			return false;
		}

		if(!$('input[name="online_start_time"]').val()){

			alert('请设置上架时间');
			return false;
		}

		if(!$('input[name="online_end_time"]').val()){

			alert('请设置下架时间');
			return false;
		}

		if(!$('input[name="publish_time"]').val()){

			alert('请设置发布时间');
			return false;
		}

		if(!$('input[name="article_title"]').val()){

			alert('请设置文章标题');
			return false;
		}

		if(!$('textarea[name="article_content"]').val()){

			alert('请输入文章内容');
			return false;
		}

		if(Zhiwo.VdianArticle.bigImageArea.find('img').length < 1){

			alert('请添加文章图片');
			return false;
		}

		Zhiwo.VdianArticle.setImageData();

		return true;
	},

	setImageData : function (){

		var imgArray = [];
		var posArray = [];
		var tmp = [];

		$('input[name="article_big_image_position[]"]').each(function(i, element){

			posArray.push($(element).val());
		});

		$('input[name="article_big_image[]"]').each(function(i, element){

			imgArray.push($(element).val());
		});

		for(var i = 0; i < imgArray.length; ++i){

			tmp.push(imgArray[i] +'|'+ posArray[i]);
		}

		$('input[name="image_data"]').val(tmp.join('||'));

		return true;
	},

	uploadBigImageHandle : function (url, width, height, pos){

		var tmp = '';

		if(pos != ''){

			tmp = ' onload="Zhiwo.VdianArticle.bigImageLoadHandle(this);"';
		}
		else{

			pos = '0,0';
		}

		var html = '<div class="big_image_row">';
			html += '<div class="tag_position" title="标签定位点"></div>';
			html += '<img src="'+ url +'" align="middle" name="article_big_image"'+ tmp +'><a name="del_article_big_image">删除</a>';
			html += '<input type="hidden" name="article_big_image_position[]" value="'+ pos +'" />';
			html += '<input type="hidden" name="article_big_image[]" value="'+ url +'" />';
			html += '</div>';

		var eleObj = Zhiwo.VdianArticle.bigImageArea.get(0);

		eleObj.innerHTML += html;
	},

	bigImageLoadHandle : function (imgObj){

		var mySelf = $(imgObj);

		var imgWidth = mySelf.width();
		var imgHeight = mySelf.height();

		var pos = mySelf.nextAll('input[name="article_big_image_position[]"]').val().split(',');

		mySelf.prev().css({
			'left': (parseFloat(pos[0]) * imgWidth) +'px',
			'top': (parseFloat(pos[1]) * imgHeight) +'px'
		});
	},

	updateTagPosition : function (imgObj, mouseX, mouseY){

		var imgWidth = imgObj.width();
		var imgHeight = imgObj.height();

		var offset = imgObj.offset();

		var imgX = offset.left;
		var imgY = offset.top;

		var pX = (mouseX - imgX - 5) / imgWidth;
		var pY = (mouseY - imgY - 5) / imgHeight;

		pX = pX.toFixed(4);
		pY = pY.toFixed(4);

		imgObj.prev().css({
			'left': (pX * imgWidth) +'px',
			'top': (pY * imgHeight) +'px'
		});

		imgObj.nextAll('input[name="article_big_image_position[]"]').val(pX +','+ pY);
	},

	kindEditorHandle : function(K) {

		var selectBigImage = K.editor({
			uploadJson : '/file/upload',
			fileManagerJson : '/file/browse',
			allowFileManager : true
		});

		Zhiwo.VdianArticle.selectBigImgButton.click(function(){

			selectBigImage.loadPlugin('image', function(){

				selectBigImage.plugin.imageDialog({

					imageUrl : '',

					clickFn : function(url, title, width, height, border, align) {

						Zhiwo.VdianArticle.uploadBigImageHandle(url, width, height, '');

						selectBigImage.hideDialog();
					}
				});
			});
		});
	},

	formatRepoEditor : function (data){

		return Zhiwo.VdianArticle.formatRepoSelectionEditor(data, null);
	},

	formatRepoSelectionEditor : function (data, container){

		var text = data.text;
		var avatar = data.avatar;
		var publishCount = data.publish_count;

		if(data.element){

			var eleObj = $(data.element);

			if(eleObj.attr('data-editor_avatar')){

				text = eleObj.html();
				avatar = eleObj.attr('data-editor_avatar');
				publishCount = eleObj.attr('data-publish_count');
			}
		}

		var html = '';

		if(avatar){

			html += '<img height="26" src="'+ avatar +'" align="top">';
		}

		html += text;

		if(publishCount){

			html += '<span title="最近1月发布数">('+ publishCount +')</span>';
		}

		return html;
	},

	formatSalesChannel : function (salesChannel){

		var ret = new Array();

		if((salesChannel & 1) > 0){

			ret.push('商城');
		}

		if((salesChannel & 2) > 0){

			ret.push('团购');
		}

		return ret.join(',');
	},

	formatRepoGoods : function (data){

		return Zhiwo.VdianArticle.formatRepoSelectionGoods(data, null);
	},

	formatRepoSelectionGoods : function (data, container){

		var html = '<span>'+ data.text;

		if(data.sales_channel){

			html += '&nbsp;/&nbsp;<span title="申销平台">'+ data.sales_channel +'</span>';
			html += '&nbsp;/&nbsp;<span title="成本价">'+ data.cost_price +'</span>';
			html += '&nbsp;/&nbsp;<span title="商城价">'+ data.price +'</span>';
			html += '&nbsp;/&nbsp;<span title="团购价">'+ data.group_price +'</span>';
			html += '&nbsp;/&nbsp;<span title="品牌">'+ data.brand_name +'</span>';
			html += '&nbsp;/&nbsp;<span title="类型">'+ data.type +'</span>';
			html += '&nbsp;/&nbsp;<span title="分类">'+ data.sort +'</span>';
		}
		else if(data.element){

			var obj = $(data.element);

			html += '&nbsp;/&nbsp;<span title="申销平台">'+ obj.attr('data-sales_channel') +'</span>';
			html += '&nbsp;/&nbsp;<span title="成本价">'+ obj.attr('data-cost_price') +'</span>';
			html += '&nbsp;/&nbsp;<span title="商城价">'+ obj.attr('data-price') +'</span>';
			html += '&nbsp;/&nbsp;<span title="团购价">'+ obj.attr('data-group_price') +'</span>';
			html += '&nbsp;/&nbsp;<span title="品牌">'+ obj.attr('data-brand_name') +'</span>';
			html += '&nbsp;/&nbsp;<span title="类型">'+ obj.attr('data-type') +'</span>';
			html += '&nbsp;/&nbsp;<span title="分类">'+ obj.attr('data-sort') +'</span>';
		}

		html +=  '</span>';

		return html;
	},

	formatRepoTag : function (data){

		return Zhiwo.VdianArticle.formatRepoSelectionTag(data, null);
	},

	formatRepoSelectionTag : function (data, container){

		var html = '<span>'+ data.text;
			html +=  '</span>';

		return html;
	}
};