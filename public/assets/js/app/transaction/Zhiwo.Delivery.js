function change(id1,id2){	
        	
		$("div[id=" + id1 + ']').show();
		$("div[id=" + id2 + ']').hide();		
}

function show(obj){
	
		if(obj.checked == true ){ 
		  $("#default").show();
		   $("#def_area_fee").attr('value',true);
		}else{  
		  $("#def_area_fee").attr('value',false);
		  $("#default").hide();  
		}
	 	  
}
		    
function popcheckwin(parentid,rt_name,rt_ids,rdms){
        // var idstr= document.getElementById('area_id').value; 
		//alert(document.getElementById("area_id_" + rdms).value);
		 var idstr= document.getElementById("area_id_" + rdms).value;
         window.open ('/transaction/setting/area/list?act_step=checkbox&idstr=' + idstr + '&parentid=' + parentid +'&rt_name=' + rt_name + '&rt_ids=' + rt_ids,'newwindow','width=400,top=200,left=200,toolbar=no,menubar=no,scrollbars=yes, resizable=no,location=no, status=no') 

}

//增加配送地区
function addarea(){
	var rdms = Math.ceil(Math.random() * 1000000);
	var str =  '<tr id="area_tr_'+ rdms +'"><input type="hidden" id="hiddenrdm" name="hiddenrdm[]" value="' + rdms + '">';
        str += '<td><div id="dlyareadiv_'+ rdms +'">配送地区<input type="text" id="areaGroupName" onclick="popcheckwin(\'dlyareadiv_'+ rdms +'\',\'areaGroupName\',\'area_id_' + rdms + '\',\''+ rdms +'\')" name="areaGroupName[]"><textarea id="area_id_' + rdms + '" name="area_id_' + rdms + '" style="display:none;"></textarea><br/>首重费用<input type="text" id="firstprice1" size="5" name="firstprice1[]">续重费用<input type="text" id="continueprice1" size="5" name="continueprice1[]"></div></td>';
	    str += '<td><a href="javascript:void(0);" onclick="deltr('+ rdms +');">删除</a></td></tr>';
	  $('#looptable').append(str);
}

function deltr(ids)
{
	if(confirm('真的需要删除吗') == true)
	{
		$('#looptable tr[id=area_tr_' + ids +']').remove();
	}
}
$(document).ready(function(){

        var obj=$("#def_area_fee")[0];
        if(obj.checked == true ){ 
		  $("#default").show();
		}else{  
		  $("#default").hide();  
		}
});