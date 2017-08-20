if(!window.Zhiwo)
{
	window.Zhiwo = new Object();
}

//积分商城
Zhiwo.PointMall = {
    //初始化函数
    init : function(){
        //查看可添加的优惠券
        $("#viewCoupon").click(
            function(){
                window.open("/marketing/coupon/list","可选优惠券窗口","height=600,width=900,top=0,left=0,toolbar=no,menubar=no,location=no,status=no") 
            }
        ); 
        //添加优惠券
        $("#addCoupon").click(Zhiwo.PointMall.addCoupon);

        //初始化积分商城浏览界面
        Zhiwo.PointMall.initChoosedGoods();

        //优惠券不能选品
        if(columnId == '3')
        {
            $("#topmenu a[name=selectGoods]").click(
                    function()
                    {
                        return false;
                    }
            );
            $("#topmenu a[name=selectGoods]").css({"color":"#cccccc"});
        }

        //更新老虎机配置
        $("#roulette_gift_setting").click(function(){
            var url = "/marketing/pointmall/lotterygift?random=" + Math.random();
            $.getJSON(url, function(res){
                switch(res.errorno)
                {
                    case -1:
                        alert('符合条件的奖品数量必须是11个!');break;
                    case -4:
                        alert('所有概率之和不能超过100！' + res.msg);break;
                    default:
                        alert(res.msg);break;
                }
            });
        });

        $("#help").click(function(){
            var status = $("tr[name=help]").attr("title");
            if(status == 'show')
            {
                $("tr[name=help]").attr("title", 'hide');
                $("tr[name=help]").show();
            }
            else
            {
                $("tr[name=help]").attr("title", 'show');
                $("tr[name=help]").hide();
            }
        });
    },

    //添加优惠券
    addCoupon : function()
    {
        var id= parseInt($.trim($(this).siblings('input[name=id]').val()));
        var points= parseInt($.trim($(this).siblings('input[name=points]').val()));
        var quantity= parseInt($.trim($(this).siblings('input[name=quantity]').val()));
        var displayOrder= parseInt($.trim($(this).siblings('input[name=displayOrder]').val()));
        var couponImg= $.trim($(this).siblings('input[name=couponImg]').val());
        var probability = parseInt($(this).siblings('input[name=probability]').val());
        var pos = parseInt($(this).siblings('input[name=pos]').val());
        if(id <= 0 || isNaN(id))
        {
            alert("请输入正确ID");
            return false;
        }
        
        if(quantity <= 0 || isNaN(quantity))
        {
            alert("请输入正确发放数量");
            return false;
        }

        if(columnId == 3)
        {
            if(points <= 0 || isNaN(points))
            {
                alert("请输入正确消耗积分");
                return false;
            }

            
            if(couponImg == '')
            {
                alert("请输选择优惠券图片");
                return false;
            }

            var startTime = $.trim($(this).siblings('input[name=startTime]').val());
            var endTime = $.trim($(this).siblings('input[name=endTime]').val());
            if(startTime == '' || endTime == '')
            {
                alert("请按要求输入有效时间!");
                return false;
            }
        }
        else
        {
            if(probability <= 0 || probability >= 100 || isNaN(probability))
            {
                alert("请输入正确的中奖概率!");
                return false;
            }

            if(pos <= 0 || pos > 11 || isNaN(pos))
            {
                alert("请输入正确位置（1-11）！");
                return false;
            }
        }

        var url = "/marketing/pointmall/addcoupon?random=" + Math.random();
        var params = {id:id, points:points,quantity:quantity,
                      displayOrder:displayOrder,couponImg:couponImg, 
                      columnId:columnId,probability:probability,
                      startTime:startTime,endTime:endTime,pos:pos};
        $.post(url, params, function(resp){
            switch(resp)
            {
                case '1':
                    alert("添加成功");
                    location.reload();
                    break;
                case '-1':
                    alert('优惠券已过期或未启用或无此优惠');
                    break;
                case '-2':
                    alert('消耗积分无效');
                    break;
                case '1062':
                    alert('已存在，不能重复添加！');
                    break;
                default:
                    alert("添加失败");
                    break;
            }
        });
    },

    //初始化选品界面
    initChoosedGoods : function()
    {
        if(runAction == 'selectgoods')
        {
            var tr = '<tr bgcolor="#7A97E0"><td width="60">商品ID</td><td width="200">商品名</td>';
            switch(columnId)
            {
                case '1' :
                    tr += '<td width="90">消耗积分</td><td width="90">兑换价格</td>\
                          <td>可兑换数量</td><td width="270">有效期</td><td width="150">排序值</td>';
                    break;
                case '2' :
                    tr += '<td width="50">中奖率</td>\
				          <td width="50">位置</td>\
                          <td width="50">发放数量</td>';
                    break;
                default:
                    tr = null;
                    break;
            }

			tr += '</tr>';

            $("#choosedGoods").append(tr);
        }
    },

    //选品
    chooseGoods : function(obj)
    {
        var goodsId = $(obj).find('td').first().text();
        var goodsImage = $(obj).find('td').first().attr("name");
        var goodsName = $(obj).find('td').eq(1).html();
        var _goodsName = $(obj).find('td').eq(1).attr("name");
        var brandId = $(obj).find('td').eq(1).attr("title");
        var marketPrice = $(obj).find('td').eq(5).text();

        var tr = '<tr><td>' + goodsId + '</td><td>' + goodsName + '</td>';
        switch(columnId)
        {
            case '1':
                tr += '<td><input type="text" size="5" name="exchangePoint" /></td>\
                        <td><input type="text" size="8" name="exchangePrice" /></td>\
                        <td><input type="text" size="8" name="issueNum" /></td>\
                        <td><input type="text" size="15" name="startTime" />至\
                        <input type="text" size="15" name="endTime" /></td>\
                        <td><input type="text" size="4" name="displayOrder" value="0"/>\
                        <input type="hidden" name="goodsName" value="' + _goodsName + '"/>\
                        <input type="hidden" name="goodsImg" value="' + goodsImage + '" />\
                        <input type="hidden" name="brandId" value="' + brandId + '" />\
                        <input type="hidden" name="marketPrice" value="' + marketPrice + '" /></td>';

                break;
            case '2':
                tr += '<td><input type="text" size="4" name="probability"/></td>\
                        <td><input type="text" size="4" name="pos" /></td>\
                        <td><input type="text" size="4" name="issueNum"/>\
                        <input type="hidden" name="goodsName" value="' + _goodsName + '"/>\
                        </td>';
                break;
        }
		tr += '</tr>';
        $("#choosedGoods").append(tr);
        $('#' + goodsId + '_addGoodsImg').click(function(){
            Zhiwo.PointMall.copyId = '#' + $(this).attr('id');
            $("#addGoodsImg").trigger('click');
        });
        
        return goodsId;
    },

    //验证选品数据
    checkGoods:function()
    {
        var ret = true;
        if(columnId == '2')
        {
            $("#choosedGoods").find("tr").not(":first").each(function(){
                var pos = $(this).find("input[name=pos]").val();
                if(pos < 1 || pos > 11 || isNaN(pos))
                {
                    alert('位置值范围1-11,请正确输入!'); 
                    ret = false;
                    return false;
                }
            });

        }
        return ret;
    }
};
