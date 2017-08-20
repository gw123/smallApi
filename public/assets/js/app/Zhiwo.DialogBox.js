/*!
 *
 * 弹窗框架
 * @package		DialogBox
 * @author		zhaoshunyao
 * @date		2012/03/25
 */

if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};
Zhiwo.DialogBox = {
	gid:function(id){return document.getElementById?document.getElementById(id):null;},
	gname:function(name){return document.getElementsByName?document.getElementsByName(name):null},
	gtname:function(name){return document.getElementsByTagName?document.getElementsByTagName(name):new Array()},
	Browser:function(){var ua, s, i;this.isIE = false;this.isNS = false;this.isOP = false;this.isSF = false;ua = navigator.userAgent.toLowerCase();s = "opera";if ((i = ua.indexOf(s)) >= 0){this.isOP = true;return;}s = "msie";if ((i = ua.indexOf(s)) >= 0) {this.isIE = true;return;}s = "netscape6/";if ((i = ua.indexOf(s)) >= 0) {this.isNS = true;return;}s = "gecko";if ((i = ua.indexOf(s)) >= 0) {this.isNS = true;return;}s = "safari";if ((i = ua.indexOf(s)) >= 0) {this.isSF = true;return;}},
	ScreenConvert: function()
	{
		var browser = new this.Browser();
		var objScreen = this.gid("ScreenOver");
		if(!objScreen) var objScreen = document.createElement("div");
		objScreen.id = "ScreenOver";
		var width = document.body.scrollWidth;
		var height = document.body.scrollHeight;
		objScreen.style.cssText = "position:absolute;left:0px;top:0px;width:"+width+"px;height:"+height+"px;margin:0px;padding:0px;filter:Alpha(Opacity=20);opacity:0.2;background-color:#000000;z-index:3;";
		document.body.appendChild(objScreen);
		var allselect = this.gtname("select");
		for (var i=0; i<allselect.length; i++) allselect[i].style.visibility = "hidden";
	},
	ScreenClean : function()
	{
		var objScreen = this.gid("ScreenOver");
		if (objScreen) objScreen.style.display = "none";
		var allselect = this.gtname("select");
		for (var i=0; i<allselect.length; i++) allselect[i].style.visibility = "visible";
	},

	t_DiglogX:0,
	t_DiglogY:0,
	t_DiglogW:0,
	t_DiglogH:0,
	wW:0,
	wH:0,
	posX:0,
	posY:0,
	
	DialogLoc : function()
	{
		if (window.innerWidth)
		{
			//netscape
			this.wW = window.innerWidth;
			this.wH = window.innerHeight;
			var bgX = window.pageXOffset;
			var bgY = window.pageYOffset;
		}
		else
		{
			//ie
			var dde = document.documentElement;
			this.wW = dde.offsetWidth;//页面可视宽度
			this.wH = dde.offsetHeight;//页面可视高度
			var bgX = dde.scrollLeft;//页面滚动宽度
			var bgY = dde.scrollTop;//页面滚动高度
		}
		this.t_DiglogX = parseInt(bgX + ((this.wW - this.t_DiglogW)/2));
		this.t_DiglogY = parseInt(bgY + ((this.wH - this.t_DiglogH)/2));
	},

	DialogShow : function(title,body,ow,oh,width,height)
	{
		Zhiwo.DialogBox.ScreenConvert();

		var showdata='<div id="DialogTop"><div id="DialogTitle">'+title+'</div><span class="close" onclick="return Zhiwo.DialogBox.DialogHide();">关闭</span></div>';
		showdata +='<div id="DialogContent">' + body + '</div>';

		var objDialog = this.gid("DialogBox");
		if (!objDialog) objDialog = document.createElement("div");
		this.t_DiglogW = ow; //位置坐标
		this.t_DiglogH = oh; //位置
		this.DialogLoc();
		objDialog.id = "DialogBox";
		var oS = objDialog.style;
		oS.display = "block";
		oS.left = this.t_DiglogX + "px";
		oS.top = this.t_DiglogY + "px";
		oS.margin = "0px";
		oS.padding = "0px";
		oS.width = width + "px";
		oS.height = height + "px";
		oS.position = "absolute";
		oS.zIndex = "10";
		oS.background = "#fff";
		oS.border = "solid #000 1px";
		objDialog.innerHTML = showdata;
		document.body.appendChild(objDialog);
		
		var topObj = this.gid("DialogTop");
		topObj.style.cursor = "move";
		topObj.setAttribute("onmousedown", function(e){Zhiwo.DialogBox.setMove(e)});
	},
	DialogHide : function()
	{
		Zhiwo.DialogBox.ScreenClean();
		var objDialog = Zhiwo.DialogBox.gid("DialogBox");
		if (objDialog) objDialog.style.display = "none";
	},
	
	setMove : function(e) 
	{
		//存储移动前的位置
		if(!e) e = window.event; 
		var boxObj = this.gid("DialogBox");
		this.posX = e.clientX - parseInt(boxObj.style.left);
		this.posY = e.clientY - parseInt(boxObj.style.top);

		var topObj = this.gid("DialogTop");
		topObj.setAttribute("onmousemove", function(e){Zhiwo.DialogBox.startMove(e)});
		topObj.setAttribute("onmouseup", function(){Zhiwo.DialogBox.endMove()});

	},
	
	startMove : function(e) 
	{
		if(!e) e = window.event; 
		var X = e.clientX - this.posX;
		var Y = e.clientY - this.posY;

		if(X < 5 ||  X > (this.wW - 100) || Y < 5 || Y > (this.wH - 100))
		{
			//超出可视范围停止移动
		}
		else
		{
			var boxObj = this.gid("DialogBox");
			boxObj.style.left = X + "px";
			boxObj.style.top = Y + "px";
		}
	},
	endMove : function() 
	{
		var topObj = this.gid("DialogTop");
		topObj.setAttribute("onmousemove", null);
	},
	
	PromptsShow : function(body,ow,oh,width,height)
	{
		Zhiwo.DialogBox.ScreenConvert();

		var showdata = '<div id="PromptsContent">' + body + '</div>';

		var objPrompts = this.gid("PromptsBox");
		if (!objPrompts) objPrompts = document.createElement("div");
		this.t_DiglogW = ow; //位置坐标
		this.t_DiglogH = oh; //位置
		this.DialogLoc();
		objPrompts.id = "PromptsBox";
		var oS = objPrompts.style;
		oS.display = "block";
		oS.left = this.t_DiglogX + "px";
		oS.top = this.t_DiglogY + "px";
		oS.margin = "0px";
		oS.padding = "0px";
		oS.width = width + "px";
		oS.height = height + "px";
		oS.position = "absolute";
		oS.zIndex = "10";
		oS.background = "#fff";
		oS.border = "solid #000 1px";
		objPrompts.innerHTML = showdata;
		document.body.appendChild(objPrompts);
	},
	PromptsHide : function()
	{
		Zhiwo.DialogBox.ScreenClean();
		var objPrompts = Zhiwo.DialogBox.gid("PromptsBox");
		if (objPrompts) objPrompts.style.display = "none";
	}
};