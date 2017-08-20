/*!
 * js全局函数
 */
 
var userAgent = navigator.userAgent.toLowerCase();
var is_webtv = userAgent.indexOf('webtv') != -1;
var is_kon = userAgent.indexOf('konqueror') != -1;
var is_mac = userAgent.indexOf('mac') != -1;
var is_saf = userAgent.indexOf('applewebkit') != -1 || navigator.vendor == 'Apple Computer, Inc.';
var is_opera = userAgent.indexOf('opera') != -1 && opera.version();
var is_moz = (navigator.product == 'Gecko' && !is_saf) && userAgent.substr(userAgent.indexOf('firefox') + 8, 3);
var is_ns = userAgent.indexOf('compatible') == -1 && userAgent.indexOf('mozilla') != -1 && !is_opera && !is_webtv && !is_saf;
var is_ie = (userAgent.indexOf('msie') != -1 && !is_opera && !is_saf && !is_webtv) && userAgent.substr(userAgent.indexOf('msie') + 5, 3);

function gid(id){return document.getElementById?document.getElementById(id):null;}
function gname(name){return document.getElementsByName?document.getElementsByName(name):null}
function gtname(name){return document.getElementsByTagName?document.getElementsByTagName(name):new Array()}

function strlen(str){return (is_ie && str.indexOf('\n') != -1) ? str.replace(/\r?\n/g, '_').length : str.length;}
function mb_strlen(str){var len = 0;for(var i = 0; i < str.length; i++) {len += str.charCodeAt(i) < 0 || str.charCodeAt(i) > 255 ? (charset == 'utf-8' ? 3 : 2) : 1;}return len;}

function str_trim(inputstring){
	if (typeof inputstring != 'string'){ return inputstring; }
	var retvalue = inputstring;
    var ch = retvalue.substring(0, 1);
    while (ch == ' ' || ch == '\r' || ch == '\n'){
   	retvalue = retvalue.substring(1, retValue.length);
   	ch = retvalue.substring(0, 1);
	}
    ch = retvalue.substring(retvalue.length-1, retvalue.length);
    while (ch == ' ' || ch == '\r' || ch == '\n'){
   	retvalue = retvalue.substring(0, retvalue.length-1);
   	ch = retvalue.substring(retvalue.length-1, retvalue.length);
	}
    return retvalue; 
}

function zeroize(value, length){
	if (!length) length = 2;
	value = String(value);
	for(var i = 0, zeros = ""; i < (length - value.length); i++){
		zeros += "0";
	}
	return zeros + value;
};    
	
function in_array(needle, haystack){
	if(typeof needle == 'string') {
		for(var i in haystack) {
			if(haystack[i] == needle) {
					return true;
			}
		}
	}
	return false;
}

function array_pop(a){
	if(typeof a != 'object' || !a.length) 
	{
		return null;
	} else {
		var response = a[a.length - 1];
		a.length--;
		return response;
	}
}

function array_push(a, value){
	a[a.length] = value;return a.length;
}

function find_tags(parentobj, tag){
	if(!isUndefined(parentobj.getElementsByTagName)) {
		return parentobj.getElementsByTagName(tag);
	} else if(parentobj.all && parentobj.all.tags) {
		return parentobj.all.tags(tag);
	} else {
		return null;
	}
}

function get_left_chars(varfield,limit_len){
	var i=0;
    var j=0;
    var counter=0;
    var cap=limit_len*2;    
    var runtime = (varfield.value.length>cap)?(cap+1):varfield.value.length;
    for (i=0; i<runtime; i++)
    {     
         if (varfield.value.charCodeat(i)>127 || varfield.value.charCodeat(i)==94)
         {
			j=j+2;  
         } 
         else
         {
			j=j+1;
         }   
    }   
    var leftchars = cap - j;    
    return (leftchars);
}

function str_encode(str){if(encodeURIComponent) return encodeURIComponent(str);if(escape) return escape(str);}
function str_decode(str){if(decodeURIComponent ) return decodeURIComponent (str);if(unescape) return unescape(str);}

function html_encode(text){var re = {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'};for (i in re) text = text.replace(new RegExp(i,'g'), re[i]);return text;}
function html_decode(text){var re = {'&lt;':'<','&gt;':'>','&amp;':'&','&quot;':'"'};for (i in re) text = text.replace(new RegExp(i,'g'), re[i]);return text;}

function check_all(form, prefix, checkall) {
	var checkall = checkall ? checkall : 'chkall';
	for(var i = 0; i < form.elements.length; i++) {
		var e = form.elements[i];
		if(e.name != checkall && (!prefix || (prefix && e.name.match(prefix)))) {
			e.checked = form.elements[checkall].checked;
		}
	}
}

function transfer_form_to_request_string(form_obj) {
	var query_string='';
	var and='';
	for(i=0;i<form_obj.length;i++){
		e=form_obj[i];
		if(e.name!=''){
			if(e.type=='radio'){
				if(e.checked==true){element_value=e.value;}
				else{continue;}
			}
			else if(e.type=='checkbox'){
				if(e.checked==true){element_value=e.value;}
				else{element_value='';}
			}
			else{
				element_value=e.value;
			}
			query_string+=and+e.name+'=' + str_encode(element_value);
			and="&";
		}
		element_value='';
	}
	return query_string;
}

/** 
 * 说明：将指定下拉列表的选项值清空 
 * @param {String || Object]} selectObj 目标下拉选框的名称或对象，必须
 */
function removeOptions(selectObj)
{
	if (typeof selectObj != 'object')
	{
		selectObj = document.getElementById(selectObj);
	}
	var len = selectObj.options.length;
	for (var i=0; i < len; i++)
	{
		selectObj.options[i] = null;
	}
}

/**
 * 说明：设置传入的选项值到指定的下拉列表中 
 * @param {String || Object]} selectObj 目标下拉选框的名称或对象，必须 
 * @param optionList 选项列表
 * @param firstOption第一个选项，如：“请选择”，可选
 * @param selected 默认选中值，可选 
 */
function setSelectOption(selectObj, optionList, parentID, firstOption, selected)
{
	if (typeof selectObj != 'object')
	{
		selectObj = document.getElementById(selectObj);
	}
	// 清空选项
	removeOptions(selectObj);
	var start = 0; 
	if (firstOption)
	{
		selectObj.options[0] = new Option(firstOption, '');
		start++;
	}
	var len = optionList.length;
	for (var i=0; i < len; i++)
	{
		if(optionList[i] == null)
		{
			continue;
		}
		if(parentID != optionList[i].addr_parent_id)
		{
			continue;
		}
		selectObj.options[start] = new Option(optionList[i].addr_title, optionList[i].addr_id);
		if(selected == optionList[i].addr_id)
		{
			selectObj.options[start].selected = 'selected';
		}
		start++; 
	}
}

function addOptionToSelect(idname)
{
   var slt=document.getElementById(idname);
   var objOption=document.createElement("OPTION");
   objOption.value='6';
   objOption.text='content';
   slt.add(objOption);
   slt.options[slt.options.length-1].selected = 'selected';
}

function getObjectKeys(object)
{
    var keys = [];
    for(k in object)
	{
		keys.push(k);
    }
    return keys;
}
function getObjectValues(object)
{
	var values = [];
	for(k in object)
	{
		values.push(object[k]);
	}
    return values;
}

function checkRadioValue(radios)
{
	if(typeof(radios.length) == 'undefined')
	{
		if(radios.checked)
		{
			return radios.value;
		}
	}
	
	for(var i = 0; i < radios.length; i++)
	{
		if(radios[i].checked)
		{
			return radios[i].value;
		} 
	}
	return '';
}

function checkSelectValue(select)
{
	for (var i = 0; i < select.options.length; i++)
	{
		if(select.options[i].value != '' && select.options[i].selected)
		{
			return true;
		} 
	} 
	return false;
}

function getSelectValue(name)
{
	var obj = document.getElementById(name);
	for (var i = 0; i < obj.length; i++)
	{
		if(obj[i].selected == true)
		{
			return obj[i].value;
		} 
	} 
	return false;
}