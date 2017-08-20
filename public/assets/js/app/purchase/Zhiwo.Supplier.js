if (!window.Zhiwo) {
	window.Zhiwo = new Object();
};
Zhiwo.supplier = {
	parttenNum: /^[\d\-]+$/,
	init: function() {
		Zhiwo.supplier.addhanle();
	},
	addhanle: function() {		
		$('#bt_addsupplier').click(function() {
			Zhiwo.supplier.openSupplierPanel();
			Zhiwo.supplier.inputVerify();
		});
	},
	openSupplierPanel: function() {
		var basehtml = $('#supplierinfo').html();
		var dialog = KindEditor.dialog({
			width : 800,
			title : '新增供应商',
			body : '<div id="bsupplierPlan"><form id="formaddsupplier" action="/purchase/supplier/add" method="post" onsubmit="return ZW.formSubmit(this, \'addSupplierHandle\')">&nbsp;&nbsp;<span id="msg" style="color:red;"></span>'+basehtml+'<input type="submit" style="display: none;" id="formaddsupplier_btn"></form></div>',
			closeBtn : {
				name : '关闭',
				click : function(e) {
					dialog.remove();
				}
			},yesBtn : {
				name : '确定',
				click : function(e) {
					var obj = tmp = msgobj = 0;
					msgobj = $('#formaddsupplier').find('span[id=msg]');
					msgobj.html('');
					var sup_name = $('#formaddsupplier').find('input[name=sup_name]').val();
					if (sup_name == '') {
						msgobj.html('请填写供应商名称');
						return false;
					}
					//公司电话
					var tel = $('#formaddsupplier').find('input[name=tel]').val();
					if (!tel) {
						msgobj.html('请正确填写公司电话');
						return false;
					}
					var bank = $('#formaddsupplier').find('input[name=bank]').val();
					if (bank == '') {
						msgobj.html('请填写开户银行');
						return false;
					} 
					//帐号
					var account_num = $('#formaddsupplier').find('input[name=account_num]').val();
					if (!account_num) {
						msgobj.html('请正确填写帐号');
						return false;
					}
					var name = $('#formaddsupplier').find('input[id=sup_name]').val();
					$.getJSON('/purchase/supplier/isexistname', {name:name}, function(data){
						if (data.s == '1') {
							msgobj.html('该供应商名称已经存在');
							return false;
						} else {
							$.getJSON('/purchase/supplier/isexisttel', {tel:tmp} ,function(data){
								if (data.s == '1') {
									msgobj.html('该供应商电话已经存在');
									return false;
								} else {											  
									$('#formaddsupplier_btn').click();	
								}
							});
						}
					});
					return false;
				}
			},
			noBtn : {
				name : '取消',
				click : function(e) {
					dialog.remove();
				}
			}
		});
	},
	inputVerify: function() {
		//邮编 postcode 6
		$('#formaddsupplier').find('input[id=postcode]').keyup(function(){
		  if(!Zhiwo.supplier.parttenNum.test($(this).val())){
			 $(this).val('');
		  }
		});
		//公司电话 tel
		$('#formaddsupplier').find('input[id=tel]').keyup(function(){
		  if(!Zhiwo.supplier.parttenNum.test($(this).val())){
			 $(this).val('');
		  }
		});
		//公司传真 fax 16 
		$('#formaddsupplier').find('input[id=fax]').keyup(function(){
		  if(!Zhiwo.supplier.parttenNum.test($(this).val())){
			 $(this).val('');
		  }
		});
		//帐号 account_num 19
		$('#formaddsupplier').find('input[id=account_num]').keyup(function(){
		  if(!Zhiwo.supplier.parttenNum.test($(this).val())){
			 $(this).val('');
		  }
		});
		//税务登记号 tax_num 6-20
		$('#formaddsupplier').find('input[id=tax_num]').keyup(function(){
		  if(!Zhiwo.supplier.parttenNum.test($(this).val())){
			 $(this).val('');
		  }
		});
	}
}
  
function addSupplierHandle(t, resp){
	if (resp.status == 1) {
		alert('添加成功');
		window.location.reload();
	} else {
		//alert(resp.errors);
		$('#formaddsupplier').find('span[id=msg]').html(resp.errors);
	}
}

function deleteSupplierHandle(t, resp){
	if (resp.status == 1) {
		alert('已成功删除');
		window.location.reload();
	} else {
		alert(resp.errors);
	}
}

// 搜索供应商
function searchSupplierHandle(form, resp){
	if (resp.status == 1) {
		var str = '<h3>查找结果</h3>';
			str += '<table width="98%" border="0" cellspacing="1" bgcolor="#dfe8f6" align="center">';
			str += '<tr><td class="btk">ID</td><td class="btk">名称</td><td class="btk">联系人</td><td class="btk">公司电话</td><td class="btk">手机</td><td class="btk">地址</td><td class="btk">操作</td></tr>';
		for(var i in resp.content) {
			str += '<tr><td class="td">'+resp.content[i].code+'</td>';
			str += '<td class="td">'+resp.content[i].name+'</td>';
			str += '<td class="td">'+resp.content[i].contact+'</td>';
			str += '<td class="td">'+resp.content[i].tel+'</td>';
			str += '<td class="td">'+resp.content[i].mobile+'</td>';
			str += '<td class="td">'+resp.content[i].address+'</td>';
			str += '<td class="td"><a onclick="return ZW.ajaxClick(this, \'viewSupplier\')" href="/purchase/supplier/view/'+resp.content[i].code+'">查看</a>&nbsp;';
			str += '<a onclick="return ZW.ajaxClick(this, \'editSupplier\')" href="/purchase/supplier/view/'+resp.content[i].code+'">修改</a>&nbsp;';
			str += '<a id="supplier_'+resp.content[i].code+'" onclick="if(confirm(\'确认删除么\') == true) {return ZW.ajaxClick(this, \'deleteSupplierHandle\');} else {return false;}" href="/purchase/supplier/delete/'+resp.content[i].code+'">删除</a>&nbsp;';
			str += '<a onclick="return addContact(\''+resp.content[i].code+'\')" href="javascript:void(0)">添加联系人</a>&nbsp;';
			str += '<a onclick="return ZW.ajaxClick(this, \'openSKUPlan\')" href="/purchase/supplier/view/'+resp.content[i].code+'">添加商品</a>&nbsp;';
			str += '</td></tr>';
		};
		str += '</table>';
		$('#searchResult').html(str);
	} else {
		alert(resp.errors);
	}
	return false;
}

// 查看供应商信息
function viewSupplier(t, resp) {
	var str = '<h3>基本信息</h3>';
		str += '<table id="baseTab">';
		str += '<tr><td class="btk">名称</td><td class="btk">商品分类</td><td class="btk">类型</td><td class="btk">地址</td><td class="btk">电话</td>';
		str += '<td class="btk">邮编</td><td class="btk">传真</td><td class="btk">法人代表</td><td class="btk">税务登记号</td>';
		str += '<td class="btk">开户银行</td><td class="btk">银行帐户名称</td><td class="btk">银行帐号</td><td class="btk">网站</td></tr>';
		str += '<td>'+resp.baseInfo.name+'</td>';
        str += '<td>'+ ((resp.baseInfo.goods_type == 0 ) ? '普通' : '海淘' )+'</td>';
		str += '<td>'+$('#type_id option[value='+resp.baseInfo.type_id+']').text()+'</td>';
		str += '<td>'+resp.baseInfo.address+'</td>';
		str += '<td>'+resp.baseInfo.tel+'</td>';
		str += '<td>'+resp.baseInfo.postcode+'</td>';
		str += '<td>'+resp.baseInfo.fax+'</td>';
		str += '<td>'+resp.baseInfo.corporate+'</td>';
		str += '<td>'+resp.baseInfo.tax_num+'</td>';
		str += '<td>'+resp.baseInfo.bank_name+'</td>';
		str += '<td>'+resp.baseInfo.bank_account_name+'</td>';
		str += '<td>'+resp.baseInfo.bank_card_num+'</td>';
		str += '<td>'+resp.baseInfo.website+'</td>';
		str += '</tr></table>';
		str += '<br><table>';
		str += '<tr><td class="btk">账期</td><td class="btk">支付宝名称</td><td class="btk">支付宝账号</td>';
		str += '<td class="btk">发票抬头</td><td class="btk">对私账户名称</td><td class="btk">对私账号</td>';
		str += '</tr><tr><td>'+resp.baseInfo.account_period+'</td>';
		str += '<td>'+resp.baseInfo.alipay_account_name+'</td>';
		str += '<td>'+resp.baseInfo.alipay_account_num+'</td>';
		str += '<td>'+resp.baseInfo.invoice_company+'</td>';
		str += '<td>'+resp.baseInfo.private_account_name+'</td>';
		str += '<td>'+resp.baseInfo.private_account_num+'</td>';
		str += '</tr></table>';
		str += '<h3>联系人信息</h3>';
		str += '<table id="contactTab">';
		str += '<tr><td class="btk">姓名</td><td class="btk">tel</td><td class="btk">手机</td><td class="btk">qq</td><td class="btk">email</td><td class="btk">旺旺</td><td class="btk">MSN</td><td class="btk">操作</td></tr>';
		for(var i in resp.contacts) {
			str += '<tr><td>'+resp.contacts[i].realname+'</td>';
			str += '<td>'+resp.contacts[i].tel+'</td>';
			str += '<td>'+resp.contacts[i].mobile+'</td>';
			str += '<td>'+resp.contacts[i].qq+'</td>';
			str += '<td>'+resp.contacts[i].email+'&nbsp;</td>';
			str += '<td>'+resp.contacts[i].ww+'&nbsp;</td>';
			str += '<td>'+resp.contacts[i].msn+'&nbsp;</td>';
			str += '<td><a href="/purchase/supplier/contact/edit/'+resp.contacts[i].id+'" onclick="return ZW.ajaxClick(this);"></a>&nbsp;';
			str += '<a id="contact_'+resp.contacts[i].id+'" href="/purchase/supplier/contact/delete/'+resp.contacts[i].id+'" onclick="if(confirm(\'确认删除么\') == true) {return ZW.ajaxClick(this, \'deleteContactHandle\');} else {return false;}">删除</a>';
			str += '</td></tr>';
		}
		str += '</table>';
		str += '<h3>货品信息</h3>';
		if (resp.skus.length != 0) {
			str += '<table id="productTab">';
			str += '<tr><td class="btk">序号</td><td class="btk">SKU号</td><td class="btk">商品名称</td><td class="btk">操作</td></tr>';
			for(var i in resp.skus) {
				str += '<tr><td>'+(~~i+1)+'</td><td>'+resp.skus[i].sku+'</td><td>'+resp.skus[i].name+'</td><td><a id="sku_'+resp.skus[i].id+'" href="/purchase/supplier/product/delete/'+resp.skus[i].id+'" onclick="if(confirm(\'确认删除么\') == true) {return ZW.ajaxClick(this, \'deleteProductHandle\');} else {return false;}">删除</a></td></tr>';
			}
			str += '</table>';
		}
	var dialog = KindEditor.dialog({
		width : 880,
		title : '查看供应商 — '+resp.baseInfo.name,
		body : '<div>'+str+'&nbsp;<br></div>',
		closeBtn : {
			name : '关闭',
			click : function(e) {
				dialog.remove();
			}
		}
	});
}

// 编辑供应商
function editSupplier(t, resp){
	var str = $('#supplierinfo').html();
	    str += '<input type="hidden" name="code" value="'+resp.baseInfo.code+'" />';
	var dialog = KindEditor.dialog({
		width : 800,
		title : '修改供应商',
		body : '<form id="formeditsupplier" action="/purchase/supplier/edit" method="post" onsubmit="return ZW.formSubmit(this, \'editHandle\')">'+str+'<input type="submit" style="display: none;" id="formeditsupplier_btn"></form>',
		closeBtn : {
			name : '关闭',
			click : function(e) {
				dialog.remove();
			}
		},yesBtn : {
			name : '确定',
			click : function(e) {
				$('#formeditsupplier_btn').click();
			}
		},noBtn : {
			name : '取消',
			click : function(e) {
				dialog.remove();
			}
		}
	});
	$('#formeditsupplier input[name=sup_name]').val(resp.baseInfo.name);
	$('#formeditsupplier input[name=postcode]').val(resp.baseInfo.postcode);
	$('#formeditsupplier input[name=address]').val(resp.baseInfo.address);
	$('#formeditsupplier input[name=tel]').val(resp.baseInfo.tel);
	$('#formeditsupplier input[name=fax]').val(resp.baseInfo.fax);
	$('#formeditsupplier input[name=corporate]').val(resp.baseInfo.corporate);
	$('#formeditsupplier input[name=bank]').val(resp.baseInfo.bank_name);
	$('#formeditsupplier input[name=account]').val(resp.baseInfo.bank_account_name);
	$('#formeditsupplier input[name=account_num]').val(resp.baseInfo.bank_card_num);
	$('#formeditsupplier input[name=tax_num]').val(resp.baseInfo.tax_num);
	$('#formeditsupplier input[name=website]').val(resp.baseInfo.website);
	$('#formeditsupplier input[name=account_period]').val(resp.baseInfo.account_period);
	$('#formeditsupplier input[name=alipay_account_name]').val(resp.baseInfo.alipay_account_name);
	$('#formeditsupplier input[name=alipay_account_num]').val(resp.baseInfo.alipay_account_num);
	$('#formeditsupplier input[name=invoice_company]').val(resp.baseInfo.invoice_company);
	$('#formeditsupplier input[name=private_account_name]').val(resp.baseInfo.private_account_name);
	$('#formeditsupplier input[name=private_account_num]').val(resp.baseInfo.private_account_num);
	$('#formeditsupplier option[value='+resp.baseInfo.type_id+']').attr('selected', true);
    /* 商品分类*/
	$('#formeditsupplier input[name=goods_type]').each(function(i,e){
        if ($(e).val() == resp.baseInfo.goods_type)        {
            $(e).attr('checked',true);

        }
        else
        {
            $(e).removeAttr('checked');
        }
        $(e).attr('disabled',true);//禁止修改
    });
	return false;
}
function editHandle(t, resp){
	if (resp.status == 1) {
		alert('已修改成功');
		window.location.reload();
	} else {
		alert(resp.errors);
	}
}

// 添加供应商联系人
function addContact(code){
	var str = $('#contactinfo').html();
	    str += '<input type="hidden" name="code" value="'+code+'" />';
	var dialog = KindEditor.dialog({
		width : 650,
		title : '添加联系人',
		body : '<form id="formaddcontact" action="/purchase/supplier/contact/add" method="post" onsubmit="return ZW.formSubmit(this, \'addContactHandle\')">&nbsp;&nbsp;<span id="msg" style="color:red;"></span>'+str+'<input type="submit" style="display: none;" id="formaddcontact_btn"></form>',
		closeBtn : {
			name : '关闭',
			click : function(e) {
				dialog.remove();
			}
		},yesBtn : {
			name : '确定',
			click : function(e) {
				var obj = tmp = msgobj = 0;
				msgobj = $('#formaddcontact').find('span[id=msg]');
				msgobj.html('');
				obj = $('#formaddcontact').find('input[id=qq]');
				tmp = obj.val();
				if (tmp.length > 0 && tmp.length < 6) {
					obj.focus();
					msgobj.html('请正确填写QQ，6-12位数字');
					return false;
				}																	  
				obj = $('#formaddcontact').find('input[id=mobile]');
				tmp = obj.val();
				if (!tmp) {
					obj.focus();
					msgobj.html('请正确填写手机号');
					return false;
				}	
				$('#formaddcontact_btn').click();
			}
		},noBtn : {
			name : '取消',
			click : function(e) {
				dialog.remove();
			}
		}
	});
	var parttenNum = /^\d+$/;
	//qq  6-12
	$('#formaddcontact').find('input[id=qq]').keyup(function(){
	  if(!parttenNum.test($(this).val())){
		 $(this).val('');
	  }
	});
	//mobile
	$('#formaddcontact').find('input[id=mobile]').keyup(function(){
	  if(!parttenNum.test($(this).val())){
		 $(this).val('');
	  }
	});
		
	addContactHandle = function(form, resp) {
		if (resp.status == 1) {
			alert('联系人添加成功');
			window.location.reload();
		} else {
			alert(resp.errors);
		}
	}
	return false;
}

// 删除联系人 
function deleteContactHandle(t, resp) {
	if (resp.status == 1) {
		alert('联系人已删除');
		window.location.reload();
	} else {
		alert(resp.errors);
	}
}

// 打开添加供应商货品面板
function openSKUPlan(t, resp) {
	var str = $('#productinfo').html();
		str += '<input type="hidden" id="sup_code" name="code" value="'+resp.baseInfo.code+'" />';
	var dialog = KindEditor.dialog({
		width : 800,
		title : '添加商品 — '+resp.baseInfo.name,
		body : '<div id="SKUPlan">'+str+'</div>',
		closeBtn : {
			name : '关闭',
			click : function(e) {
				dialog.remove();
			}
		}
	});	
	return false;
}

// 搜索货品
function searchProductHandle(t, resp) {
	var code = $('#SKUPlan #sup_code').val();
	$('#SKUPlan .td').parent().remove();
	if (resp.status == 1) {
        for(var i in resp.content) {
            var str = '<tr><td class="td">'+resp.content[i].sku+'</td><td class="td">'+resp.content[i].name+'</td>';
			str += '<td class="td"><a id="sku_'+resp.content[i].product_id+'" href="/purchase/supplier/product/add?sku='+resp.content[i].sku+'&name='+encodeURIComponent(resp.content[i].name)+'&barcode='+resp.content[i].barcode+'&code='+code+'" onClick="return ZW.ajaxClick(this, \'addProductHandle\')">添加</a></td></tr>';
			$('#SKUPlan tr:last').after(str);
		}
		$(".ke-dialog").css("height",'auto');
	} else {
		alert(resp.errors);
	}
	return false;
}

// 添加供应商货品
function addProductHandle(t, resp){
	if (resp.status == 1) {
		alert('货品添加成功');
		$(t).parent().parent().remove(); 
	} else {
		alert(resp.errors);
	}
}

// 删除供应商货品
function deleteProductHandle(t, resp) {
	if (resp.status == 1) {
		alert('货品已删除');
		$(t).parent().parent().remove();
	} else {
		alert(resp.errors);
	}
	return false;
}
