<?php
namespace api\service;

use api\model\ChartModel;

class ChartService  extends \yii\db\ActiveRecord {


    public static function tableName()
    {
        return 'chart';
    }

    /***
     * 创建模板
     * @param $data
     * @return ChartModel|bool
     */
    public static function  createTemplate($data)
    {
        if(empty($data))
            return false;

        $insertData['name'] = $data['name'];
        $insertData['content'] = json_encode($data['content']);
        $chartModel = new ChartModel();
        $chartModel->load($insertData);

        if( $chartModel->validate()&&$chartModel->save())
        {
            return $chartModel;
        }

        return false;
    }

    public static function  updateTemplate($data)
    {

    }

}