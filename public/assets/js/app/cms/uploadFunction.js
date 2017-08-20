var userAgent = navigator.userAgent.toLowerCase();
var is_opera = userAgent.indexOf('opera') != -1 && opera.version();
var is_moz = (navigator.product == 'Gecko') && userAgent.substr(userAgent.indexOf('firefox') + 8, 3);
var is_ie = (userAgent.indexOf('msie') != -1 && !is_opera) && userAgent.substr(userAgent.indexOf('msie') + 5, 3);
var is_safari = (userAgent.indexOf('webkit') != -1 || userAgent.indexOf('safari') != -1);

var aid = 1;
var extensions = 'jpg,jpeg,gif,png'; //逗号分隔
var forms;
var nowUid = 0;
var uploadStat = 0;
var picid = 0;
var upid = 0;
var mainForm;
var successState = false;
var ieVersion = userAgent.substr(userAgent.indexOf('msie') + 5, 3);
var lang = new Array();
lang['attachment_ext_notallowed']	= '对不起，只允许上传 jpg 格式图片。';
lang['attachment_deletelink']	= '删除';
lang['attachment_copykey']	= '复制上一张';
lang['need_ie'] = '对不起，请在IE浏览器下面使用本功能';
var attachkeyid = new Array();

function $(id)
{
	return document.getElementById(id);
}

function getExt(path)
{
	return path.lastIndexOf('.') == -1 ? '' : path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
}

function findInArray(val,object)
{
	for(k in object)
	{
		if(object[k] == val)
		{
			return k;
		}
	}
	return 0;
}

function deleteArray(val,object)
{
	for(i = 0; i <object.length; i++)
	{
		if(object[i] == val)
		{
			object.splice(i,1);
		}	
	}
}

function copyKey(id)
{
	var kid = findInArray(id,attachkeyid);
	if(kid > 0)
	{
		var lastkid = kid - 1;
		$('key_' + attachkeyid[kid]).value = $('key_' + attachkeyid[lastkid]).value;
	}
}

function delAttach(id)
{
	$('attachbody').removeChild($('attach_' + id).parentNode.parentNode.parentNode);
	if($('attachbody').innerHTML == '')
	{
		addAttach();
	}

	deleteArray(id,attachkeyid);
	
	$('localimgpreview_' + id + '_menu') ? document.body.removeChild($('localimgpreview_' + id + '_menu')) : null;
}

function addAttach() 
{
	newnode = $('attachbodyhidden').rows[0].cloneNode(true);
	var id = aid;
	var tags;
	tags = newnode.getElementsByTagName('form');
	for(i in tags)
	{
		if(tags[i].id == 'upload')
		{
			tags[i].id = 'upload_' + id;
		}
	}
	tags = newnode.getElementsByTagName('input');
	for(i in tags) 
	{
		if(tags[i].name == 'attach') 
		{
			tags[i].id = 'attach_' + id;
			tags[i].name = 'attach';
			tags[i].onchange = function() {insertAttach(id)};
			tags[i].unselectable = 'on';
		}
	}
	tags = newnode.getElementsByTagName('span');
	for(i in tags) 
	{
		if(tags[i].id == 'localfile')
		{
			tags[i].id = 'localfile_' + id;
		}
	}
	aid++;
	$('attachbody').appendChild(newnode);
}

function insertAttach(id)
{
	var localimgpreview = '';
	var path = $('attach_' + id).value;
	var ext = getExt(path);
	var re = new RegExp("(^|\\s|,)" + ext + "($|\\s|,)", "ig");
	var localfile = $('attach_' + id).value.substr($('attach_' + id).value.replace(/\\/g, '/').lastIndexOf('/') + 1);

	if(path == '') 
	{
		return;
	}
	if(extensions != '' && (re.exec(extensions) == null || ext == '')) 
	{
		alert(lang['attachment_ext_notallowed']);
		return;
	}
	
	var $inhtml = '<table cellspacing="2" cellpadding="2">';
	if(is_ie && ieVersion < 7.0) 
	{
		$inhtml += '<tr><td><img src="' + $('attach_' + id).value+'" height="80"></td>';
	} 
	else 
	{
		$inhtml += '<tr><td>' + localfile +'</td></tr><tr>';
	}

	if(id == 1)
	{
		$inhtml += '<td>图片关键词: ';
	}
	else
	{
		$inhtml += '<td>图片关键词: <a href="javascript:;" onclick="copyKey(' + id + ')">[' + lang['attachment_copykey'] + ']</a>';
	}
	$inhtml += '<br /><textarea name="pic_key" id="key_' + id + '" cols="50" rows="4"></textarea>';
	$inhtml += '<span id="showmsg' + id + '">&nbsp; <a href="javascript:;" onclick="delAttach(' + id + ')">[' + lang['attachment_deletelink'] + ']</a></span>';
	$inhtml += '</td></tr></table>';
	
	$('localfile_' + id).innerHTML = $inhtml;
	$('attach_' + id).style.display = 'none';
	
	attachkeyid.push(id);
	
	addAttach();
}

function upload() 
{
	if(typeof(forms[nowUid]) == 'undefined') return false;
	var nid = forms[nowUid].id.split('_');
	nid = nid[1];
	if(nowUid>0) 
	{
		var upobj = $('showmsg'+upid);
		if(uploadStat==1) 
		{
			upobj.innerHTML = '上传成功';
			successState = true;
			var InputNode;
			//两种生成方式，解决浏览器之间的兼容性问题
			try
			{
				//IE模式下的创建方式,解决常规setAttribute设置属性带来的一些未知的错误
				var InputNode = document.createElement("<input type=\"hidden\" id=\"picid_" + picid + "\" value=\""+ upid +"\" name=\"picids["+picid+"]\">");
			} 
			catch(e) 
			{
				//非IE模式则须要用下列的常规setAttribute设置属性，否则生成的结果不能正常初始化
				var InputNode = document.createElement("input");
				InputNode.setAttribute("name", "picids["+picid+"]");
				InputNode.setAttribute("type", "hidden");
				InputNode.setAttribute("id", "picid_" + picid);
				InputNode.setAttribute("value", upid);
			}
			mainForm.appendChild(InputNode);

		} 
		else 
		{
			upobj.innerHTML = '上传失败:'+uploadStat;
		}
	}
	if($('showmsg'+nid) != null) 
	{
		$('showmsg'+nid).innerHTML = '上传中，请等待...<br />(如果时间过久，请<a href="javascript:;" onclick="forms[nowUid].submit();">重试</a>)';
		forms[nowUid].submit();
	} 
	else if(nowUid+1 == forms.length) 
	{
		if(!successState) return false;
		mainForm.submit();
	}
	upid = nid;
	nowUid++;
	uploadStat = 0;
}

function startUpload() 
{
	$('btnupload').disabled = true;
	mainForm = $('albumresultform');
	forms = $('attachbody').getElementsByTagName("form");
	upload();
}

addAttach();