if(!window.Zhiwo)
{
	window.Zhiwo = new Object();
}

//选品通用js
Zhiwo.SelectGoods = {

    //当前项目对象
    project : null,

    //已选商品队列
    choosedGoods: [],

    init : function(obj){
        //搜索商品
        $('#searchGoodsForm').submit(this.searchGoods); 
        this.project = obj;
        this.project.init();
        //初始化表格
        this.initTr();
        //提交已选商品
        this.submitGoods();
        this.clearAll();
    },
    
    //搜素商品
    searchGoods : function() {
        var url = '/marketing/selectgoods/search?random=' + Math.random();
        var params = {
                searchType : $('select[name=search_type] option:selected').val(), 
                searchKey : $("#goods input[name=search_key]").val(),
                typeId : $('select[name=type_id] option:selected').val(),
                catId : $('select[name=cat_id] option:selected').val(),
                sellPriceStart : $("#goods input[name=sell_price_start]").val(),
                sellPriceEnd : $("#goods input[name=sell_price_end]").val(),
                brandId : $("select[name=brand_id] option:selected").val()
            };
        $.post(url, params, function(resp){
            Zhiwo.SelectGoods.genGoods(resp);
        });
        return false;
    },

    //生成可选商品信息,分页信息
    genGoods : function(resp)
    {
        var first_child = $('#goodsInfo').find('tr:first-child');
    	$('#goodsInfo').empty();
        $('#goodsInfo').append(first_child);
        for (var i in resp.rows) 
        {
            //goods id
            var tr = '<tr data-sales-channel="'+resp.rows[i].sales_channel +'" data-tax-rate="';
                tr += (typeof (resp.rows[i].sku_tax_rate) == 'undefined' ? 0 : resp.rows[i].sku_tax_rate)+'"class="trpointer';
                if($.inArray(resp.rows[i].goods_id, Zhiwo.SelectGoods.choosedGoods) > -1)
                {
                    tr += ' choosed';
                }
            tr += '" data-seaamoy-price="' + ((resp.rows[i].sales_channel != '4') ? 0 : resp.rows[i].seaamoy_price)+ '" data-goods-attribute=" ' + ((resp.rows[i].sales_channel != '4') ? '普通商品' : (resp.rows[i].sku_channel == 1) ? '海淘自营' : '海淘代销') + '" ';
            tr += ' data-group-price="' +resp.rows[i].group_price + '" data-price="'+resp.rows[i].price+ '">';
            //goods name
            tr +='<td name="' + resp.rows[i].small_pic + '">' + resp.rows[i].goods_id + '</td>\
                     <td name="' + resp.rows[i].name + '" title="'+ resp.rows[i].brand_id +'"\
                     >' + resp.rows[i].name + '<span style="color:blue;display:block;">\
                     库存：' + resp.rows[i].stock + '，销量：' + resp.rows[i].buy_count + '</span></td>';
            // goods attribute
            tr += '<td>' +((resp.rows[i].sales_channel != '4') ? '普通商品' : (resp.rows[i].sku_channel == 1) ? '海淘自营' : '海淘代销') + '</td>';
            // goods sku
            var sku = [];
            for (var j in resp.rows[i].skulist.rows)
            {
                sku[j] = '<span>' + resp.rows[i].skulist.rows[j].sku_pack + '</span>';
            }
            
            tr += '<td>' + sku.join('<hr />') + '</td>';

            // goods cost price
            var cost_price = [];
            for (var j in resp.rows[i].skulist.rows)
            {
                cost_price[j] = resp.rows[i].skulist.rows[j].cost_price * resp.rows[i].skulist.rows[j].sku_quantity;
            }
            tr +=  '<td class="cost-price">' + cost_price.join('<hr />') + '</td>';

            // goods group price
            tr += '<td>';
            if(resp.rows[i].sales_channel == '3')        
            {
                  tr += resp.rows[i].group_price;
            }
            tr += '</td>';
            // goods price
            tr += '<td>'+ resp.rows[i].price +'</td>';
            //goods seaamoy price
            tr += '<td>' + ((resp.rows[i].sales_channel != '4') ? '----' : resp.rows[i].seaamoy_price) + '</td>';
            // goods tax rate
            tr +=  '<td>'+((typeof (resp.rows[i].sku_tax_rate) == 'undefined') ? '----' : resp.rows[i].sku_tax_rate+ '%')+ '</td>';

            // goods brand
            var brandName = [];
            var type = [];
            var sort = [];
            for (var k in resp.rows[i].skulist.rows)
            {
                brandName[k] = resp.rows[i].skulist.rows[k].brand_name;
                type[k] = resp.rows[i].skulist.rows[k].type_name;
                sort[k] = resp.rows[i].skulist.rows[k].sort_name;
            }
            tr += '<td>' + brandName.join('<hr />') +'</td><td>' +
                  type.join('<hr />') + '</td><td>' + 
                  sort.join('<hr />') + '</td>';

            tr += '</tr>';
    	    $('#goodsInfo').append(tr);
        }
    
        $('#goodsPages').html(resp.pages);
        //分页
        $("#goodsPages a").bind("click", function(){
            var fpage = $(this).attr("href");
            $.get(fpage,function(resp){
                Zhiwo.SelectGoods.genGoods(resp);
            });
            return false;
        });
    
        //双击选品
        $("#goodsInfo").find("tr").not(":first").dblclick(this.chooseGoods);
        Zhiwo.SelectGoods.initTr();
    },

    //选择商品
    chooseGoods : function()
    {
        var goodsId = $(this).find('td').first().text();

        //检查是否在队列中
        if($.inArray(goodsId, Zhiwo.SelectGoods.choosedGoods) >= 0)
        {
            alert("商品:" + goodsId + "，此商品已经被选择过了！");
            return false;
        }

        //进入选选品区成功返回goodsId，失败返回-1
        var add = Zhiwo.SelectGoods.project.chooseGoods(this);
        if(add == goodsId)
        {
            $(this).addClass('choosed');
            Zhiwo.SelectGoods.choosedGoods.push(goodsId);
        }
        else
        {
            alert("添加商品：" + goodsId + "失败！");
        }

        Zhiwo.SelectGoods.initTr();
    },

    //删除已选择的商品
    clearChoosed : function()
    {
        var goodsId = $(this).find('td').first().text();
        if(confirm("确认要从选品里删除[" + goodsId + "]吗?"))
        {
            var pos = $.inArray(goodsId, Zhiwo.SelectGoods.choosedGoods);
            if(pos > -1)
            {
                Zhiwo.SelectGoods.choosedGoods.splice(pos, 1);
                $(".trpointer").each(
                        function()
                        {
                            var id = $(this).find('td').first().text();
                            if(goodsId == id)
                            {
                                $(this).removeClass('choosed');
                            }
                        }
                );
                $(this).remove();
            }
        }
    },

    //初始化表格数据
    initTr : function()
    {
        $("table tr").not(":first").addClass('trpointer');
        if(runAction == 'selectgoods')
        {
            $("#choosedGoods").find('tr').not(":first").unbind().bind("dblclick", Zhiwo.SelectGoods.clearChoosed);
        }
        $(".trpointer").hover(
            function(){
                $(this).addClass("hover");
            },
            function(){
                $(this).removeClass("hover");
            }
        );
		$("input[name=startTime]").calendar();
		$("input[name=endTime]").calendar();
        $("input").dblclick(function(e){
            e.stopPropagation();
            return false;
        });

    },

    //提交选品
    submitGoods : function()
    {
        $("#submitGoods").bind("click", function(){
            var choosedGoods = $("#choosedGoods").find("tr").not(":first").not(".uploadify-ok");
            var len = choosedGoods.length;
            if(len < 1)
            {
                alert("请选择要添加的商品！");
            }
            
            if(Zhiwo.SelectGoods.checksubmitGoods())
            {
                choosedGoods.each(function(){
                    var url = '/marketing/selectgoods?random=' + Math.random();
                    var goodsId = $(this).find('td').first().text();
                    var $this = this;
                    url += '&goodsId=' + goodsId + '&columnId=' + columnId;
                    var params = {action:'addgoods',project:project};
                    $(this).find('input').each(function()
                    {
                            params[$(this).attr('name')]  =  $(this).val();
                    });
                    $.post(url, params,function(res){
                        if(res.status == 'succ') 
                        {
                            $($this).addClass('uploadify-ok');
                            Zhiwo.SelectGoods.errorMsg('-成功', $this, true);
                        }
                        else
                        {
                            $($this).addClass('uploadify-error');
                            Zhiwo.SelectGoods.errorMsg(res.msg, $this);
                        }
                        Zhiwo.SelectGoods.initTr();
                    });
                });
            }
        });
    },

    //验证提交的选品
    checksubmitGoods : function()
    {
        //暂时取消验证
        return true;

        //原验证代码保留，批量设置上线后再使用
        var flag = true;
        $("#choosedGoods").find("tr").not(":first").each(
            function()
            {
                var hasTime = false;
                $(this).find("input").each(function(){
                    if($.trim($(this).val()) == '')
                    {
                        alert("所有数据必须填写！请检查后提交");
                        flag = false;
                        return false;
                    }
                    var name = $(this).attr("name");
                    if( name == "startTime" || name == "endTime")
                    {
                        hasTime = true;
                    }
                });
                
                if(!flag)
                {
                    return false;
                }

                if(hasTime)
                {
                    //验证时间--起始时间必须大于结束时间，起始时间必须大于等于现在
                    var date = new Date();
                    var now = Date.parse(date.toDateString() + ' 00:00:00 GMT+0800 (CST)');
                    var startTime = Date.parse($(this).find("input[name=startTime]").val().replace(/-/g,   "/"));
                    var endTime = Date.parse($(this).find("input[name=endTime]").val().replace(/-/g,   "/"));
                    if(startTime < now)
                    {
                        Zhiwo.SelectGoods.errorMsg('-开始时间不能小于现在', this);
                        flag =false;
                    }
                    else if(startTime > endTime)
                    {
                        Zhiwo.SelectGoods.errorMsg('-开始时间不能小于结束时间', this);
                        flag =false;
                    }
                    else
                    {
                        $(this).find("td").last().find('span').remove();
                    }
                }
            });
        //验证数据格式--提示信息在checkGoods里
        var check = Zhiwo.SelectGoods.project.checkGoods();
        if(!check)
        {
                return false;
        }

        return flag;
    },

    //清除已选商品
    clearAll : function()
    {
       $("#clearGoods").bind("click", function(){
           if(confirm("确认清除所有选品吗？"))
            {
                $("#choosedGoods").find("tr").not(":first").remove();
                $("#goodsInfo").find("tr").removeClass("choosed");
                Zhiwo.SelectGoods.choosedGoods = [];
            }
       });
    },

    //显示错误信息
    errorMsg : function(msg, obj)
    {
        var isSucc = arguments[2] || false;
        if(isSucc)
        {

            //$(obj).find("td").last().find("span").remove();
            $(obj).find("td").last().append('<span class="uploadify-succ">-成功</span>');
        }
        else
        {
            var span = $(obj).find("td").last().find('span');
            if(span.length > 0)
            {
                span.text(msg);
            }
            else
            {
                $(obj).find("td").last().append('<span class="uploadify-fail">-'+ msg +'</span>');
            }
        }
    }
};
