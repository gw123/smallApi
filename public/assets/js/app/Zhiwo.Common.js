/**
 * 一些公用函数
 */
 
if (!window.Zhiwo) {
	window.Zhiwo = new Object();
};
Zhiwo.Common = {
	/**
	 * 描述：格式化时间
	 * 用法：
	 * var d = new Date();
	 * alert(ZW.dateFormat(d));
	 */
	dateFormat: function(d, pattern) {
		pattern = pattern || 'yyyy-MM-dd';
		var y = d.getFullYear().toString(),
			o = {
				M: d.getMonth() + 1, //month
				d: d.getDate(), //day
				h: d.getHours(), //hour
				m: d.getMinutes(), //minute
				s: d.getSeconds() //second
			};
		pattern = pattern.replace(/(y+)/ig, function(a, b) {
			return y.substr(4 - Math.min(4, b.length));
		});
		for (var i in o) {
			pattern = pattern.replace(new RegExp('(' + i + '+)', 'g'), function(a, b) {
				return (o[i] < 10 && b.length > 1) ? '0' + o[i] : o[i];
			});
		}
		return pattern;
	},
	/**
	 * 描述：ajax提交表单
	 * @param form 表单对象
	 * @param callback 可选回调函数, 格式为callback(form, resp)
	 * 用法：<form ... onsubmit="return ZW.formSubmit(this, callback)"></form>
	 */
	formSubmit: function(form, callback){
		var url = form.action;
		var data = [];
		for( var i=0, j = form.elements.length; i < j; i++ ) {
			if (form.elements[i].name) {
				if (form.elements[i].type == 'radio' || form.elements[i].type == 'checkbox')
					if(form.elements[i].checked != true) 
						continue;
				data.push(form.elements[i].name+'='+form.elements[i].value);
			}
		}
		data = data.join('&');
		var callback = callback;
		var respHandle = function(resp) {
			if (callback != null) {
				eval(callback+'(form, resp)');
			} else {
				if (resp.errors) {
					alert(resp.errors);
				} else if(resp.content) {
					alert(resp.content);
				} else {
					alert(resp);
				}
			}
		}
		$.post(url, data, respHandle);
		return false;
	},
	/**
	 * 描述：ajax点击链接
	 * @param t 链接对象
	 * @param callback 可选回调函数, 格式为callback(t, resp)
	 * 用法：<a ... onclick="return ZW.ajaxClick(this, callback)"></a>
	 */
	ajaxClick: function(t, callback){
		var url = $(t).attr('href');
			url += (url.indexOf('?') === -1 ? '?' : '&') + Math.random();
		var callback = callback;
		var respHandle = function(resp) {
			if (callback != null) {
				eval(callback+'(t, resp)');
			} else {
				if (resp.errors) {
					alert(resp.errors);
				} else if(resp.content) {
					alert(resp.content);
				} else {
					alert(resp);
				}
			}
		}
		$.get(url, respHandle);
		return false;
	}
};

var ZW = ZW || {};
ZW.apply = function(o, c, defaults){
	if(defaults){
		ZW.apply(o, defaults);
	}
	if(o && c && typeof c == 'object'){
		for(var p in c){
			o[p] = c[p];
		}
	}
	return o;
};

ZW.apply(ZW, {
	applyIf : function(o, c){
		if(o){
			for(var p in c){
				if(typeof o[p] === 'undefined'){
					o[p] = c[p];
				}
			}
		}
		return o;
	}
});

ZW.apply(ZW, Zhiwo.Common);

ZW.apply(ZW, {
	/**
	 * 返回变量类型
	 *
	 * @param {Mixed} value
	 * @return {String}
	 */
	typeOf: function(o) {
		var toS = Object.prototype.toString,
		types = {
			'undefined'         : 'undefined',
			'number'            : 'number',
			'boolean'           : 'boolean',
			'string'            : 'string',
			'[object Function]' : 'function',
			'[object RegExp]'   : 'regexp',
			'[object Array]'    : 'array',
			'[object Date]'     : 'date',
			'[object Error]'    : 'error'
		};
		return  types[typeof o] || types[toS.call(o)] || (o ? 'object':'null');
	}
});

ZW.apply(Function.prototype, {
	/**
	 * 创建一个回调函数
	 * CODE:
	 * var sayHi = function(name){
	 * 	alert('Hi, ' + name);
	 * }
	 * sayHi.createCallback('Fred');
	 */
	createCallback : function(/*args...*/){
        var args = arguments,
            method = this;
        return function() {
            return method.apply(window, args);
        };
    }
});


ZW.String = {
	/**
	 * 格式化字符串
	 * alert(ZW.String.format("{1} and {2} and {3}", "papers", "shirt", "wear"));
	 */
	format: function(string) {
		var args = arguments;
		var pattern = new RegExp("\{([1-" + arguments.length + "])\}", "g");
		return String(string).replace(pattern, function(match, index) {
			return args[index];
		});
	},
	/**
	 * 去掉字符串两端空格
	 */
    trim: function(string) {
        return string.replace(/^\s+|\s+$/g, "");
    },
	/**
	 * 左侧补全字符串
	 * var s = ZW.String.leftPad('123', 5, '0'); // return '00123'
	 */
    leftPad: function(string, size, character) {
        var result = String(string);
        character = character || " ";
        while (result.length < size) {
            result = character + result;
        }
        return result;
    }
}