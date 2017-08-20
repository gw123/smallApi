/**
 * 用于操作跳转
 */

function showSec(){
		var myTimer=document.getElementById('timer');
		var sec=myTimer.innerHTML;
		var leftSec=parseInt(sec)-1;
		myTimer.innerHTML=leftSec;
		if(leftSec==0){
			//停止定时器
			window.clearInterval(myInterval);
			//跳转到main.php
			window.location.href='/storage/storehouse/list';
			
		}
		
	}


	var myInterval=window.setInterval('showSec()',500);
