//发货状态：0=未发货,1=缺货,2=配货中,3=已发货,4=部分退货,5=已全退货,6=扫描验货
    const ShipStatus = {
        '_':'订单状态',
        '0':'未发货',
        '1':'缺货',
        '2':'配货中',
        '6':'扫描验货',
        '3' :'已发货',
        '4': '部分退货',
        '5': '全部退货',
    }

    const ReshipStatus = {
        '_':'发货状态',
        'no' :'未退货',
        'yes':'申请退货'
    }

    const OrderChannel  ={
        '_' :'订单渠道',
        'zhiwo':'PC',
        'wap':'主站Wap',
        'tianmao':'天猫系',
        'qq':'QQ',
        'beauty_buyer':'美妆买手',
        'other':'其他渠道',
        'wholesale':'分销'
    }

    /*
    * 物流公司编码(SF=顺丰、EMS=标准快递、EYB=经济快件、ZJS=宅急送、YTO=圆通 、ZTO=中通(ZTO)、HTKY=百世汇通、 UC=优速、STO=申通、TTKDEX=天天快递、
    * QFKD=全峰、FAST=快捷、POSTB=邮政小包、GTO=国通、YUNDA=韵达、JD=京东配送、DD=当当宅配、 AMAZON=亚马逊物流、OTHER=其他(只传英文编码))*/
    const  DeliveryCompany ={
        '_' : '选择物流',
        'STO': '申通',
        'YTO':"圆通",
        'ZTO':'中通',
        'HTKY':'百世汇通',
        'YUNDA' : '韵达',
        'UC':'优速',
        'TTKDEX':'天天快递',

        'ZJS':'宅急送',
        'JD' : '京东',
        'TM':'天猫',

        'SF': '顺丰',
        'EMS': 'EMS',
        'EMS_GSB':'邮政小包',
        'OTHER':'其他',
       // 'ems_xiao':'邮政小包'
    }

    const  DeliveryChannel ={
        '全部渠道': DeliveryCompany,
        'Express_5' :{
            'STO' : '申通',
            'YTO':"圆通",
            'ZTO':'中通',
            'HTKY':'百世汇通',
            'YUNDA' : '韵达',
            'UC':'优速',
            'TTKDEX':'天天快递',
            'ZJS':'宅急送',
        },
        'EMS_15':{
            'EMS': 'EMS',
            'EMS_GSB':'邮政小包',
        },
        'COD':{
            'ZJS':'宅急送',
        },
        'JdExpress':{
            'ZTO':'中通',
            'HTKY':'百世汇通',
        },
        'JdCOD':{
            'ZTO':'中通',
            'HTKY':'百世汇通',
        },
        'HYSExpress':{
            'YTO':"圆通",
            'ZTO':'中通',
            'HTKY':'百世汇通',
            'YUNDA' : '韵达',
        },
        'HYSCOD':{
            'YTO':"圆通",
            'ZTO':'中通',
            'HTKY':'百世汇通',
            'YUNDA' : '韵达',
        }
    }


