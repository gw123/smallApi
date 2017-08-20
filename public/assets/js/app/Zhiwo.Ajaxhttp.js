/*!
 *
 * ajax框架
 * @package		Ajaxhttp
 * @author		zhaoshunyao
 * @date		2012/03/25
 */

if (!window.Zhiwo) {
	window.Zhiwo = new Object()
};
Zhiwo.Ajaxhttp = {
	Xpool: [], //线程池
	getX: function()
    {
		this.Xpool[this.Xpool.length] = this.createX();
		return this.Xpool[this.Xpool.length - 1];
    },
    createX: function()
    {
        if(window.ActiveXObject)
		{
			//IE
			try
			{
				var X = new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e)
			{
				alert(e.message);
			}
		}
		else if(window.XMLHttpRequest)
		{
			//mozilla 1.0+  safari 1.2+
			try
			{
				var X = new XMLHttpRequest();
				if(X.overrideMimeType)
				{
　　				X.overrideMimeType("text/xml");
　				}
			}
			catch(e){alert(e.message);}	
		}
        return X;
	},
    getR: function(url,callback)
    {
        var Xobj = this.getX();
		try
		{
			if (url.indexOf("?") > 0)
			{
				url += "&randnum=" + Math.random();
            }
            else
            {
                url += "?randnum=" + Math.random();
            }
			Xobj.onreadystatechange = function ()
            {                   
				if (Xobj.readyState == 4)
                {
					if(Xobj.status == 200)
					{
						callback(Xobj.responseText);
					}
					else
					{
						throw new Error('Ajaxhttp bad request:' + Xobj.statusText);
					}
				}
                else
				{
					callback();
				}
			};
			Xobj.open("GET", url, true);
            Xobj.send(null);
		}
		catch(e)
		{
			alert(e.message);
		}
    },
    postR: function(url, callback, data)
    {
		var	Xobj = this.getX();
		try
		{
			Xobj.open("POST", url, true);
			Xobj.setRequestHeader('If-Modified-Since', '0'); //清空缓存
            Xobj.setRequestHeader("Content-Length",data.length);    
            Xobj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            Xobj.send(data);
            Xobj.onreadystatechange = function ()
            {                   
				if (Xobj.readyState == 4)
                {
					if(Xobj.status == 200)
					{
						callback(Xobj.responseText);
					}
					else
					{
						throw new Error('Ajaxhttp bad request:' + Xobj.statusText);
					}
                }
                else
				{
					callback();
				}
            };
		}
		catch(e)
        {
			alert(e.message);
		}
    }
};