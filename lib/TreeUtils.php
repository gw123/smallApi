<?php
namespace lib;

class TreeUtils {

    /**
     * calDepth 节点宽度计算
     * 
     * @param mixed $node 
     * @static
     * @access public
     * @return void
     */
    public static function calDepth(&$node) {

            if(count($node->children) == 0){
                $node->depth = 2;
                return;
            }

            foreach($node->children as $child) {
                self::calDepth($child);
            }

            foreach($node->children as $child) {
                $node->depth += $child->depth;
            }

            $node->depth = $node->depth + 2;
    }

    /**
     * calLftAndRgt 计算节点的左值和右值
     * 
     * @param mixed $node 
     * @static
     * @access public
     * @return void
     */
    public static function calLftAndRgt(&$node){
        //leaf node return
        if(count($node->children) == 0) {
            return;
        } 
        $firstNode = $node->children[0];
        $firstNode->lft = $firstNode->parent->lft + 1;
        $firstNode->rgt = $firstNode->lft+$firstNode->depth-1;
        $preNode = $firstNode;

        foreach($node->children as $k=>$child) {
            if($k == 0) {
                continue;
            }
            $child->lft= $preNode->rgt + 1;
            $child->rgt = $child->lft + $child->depth -1;
            $preNode = $child;
        }

        foreach($node->children as $child) {
            self::calLftAndRgt($child);
        }

    }
       
    public static function buildZTree($root,$selected='') {
        $categories = Category::getCategoryList();
        $results = [];
        $in_selected = [];
        $in_selected = array_flip(explode(",",$selected));
        $label = [];
        foreach($categories as $cate) {
            if(isset($in_selected[$cate['id']])) {
                $label[] = $cate['name'];
                $results[] = ['id'=>$cate['id'],'pId'=>$cate['parentid'],'name'=>$cate['name'],'checked'=>true];
            }else{
                $results[] = ['id'=>$cate['id'],'pId'=>$cate['parentid'],'name'=>$cate['name']];
            }
        }
        return ['categories'=>$results,'label'=>implode(",",$label)];
    }

    public static function buildTree($rows,$root,$exclude=[]) {
        $current = [];
        foreach($rows as $row ) {
            $data = ['text'=>$row['name'],'id'=>$row['id']];
            if($row['parentid'] == $root && !in_array($row['code'],$exclude)) {
                $children = self::buildTree($rows,$row['id']);
                if ($children) {
                    $row['children'] = $children;
                }
            }
            $current[] = $data;
        }
        return $current;
    }

    public static function buildCategoryTree($root,$lazy=true,$exclude=[]) {
        $rows = Category::find()->where(['status'=>1,'parentid'=>$root])->asArray()->all();
        $current = [];
        foreach($rows as $row ) {
            $data = ['text'=>$row['name'],'id'=>$row['id']];
            if($row['parentid'] == $root && !in_array($row['code'],$exclude)) {
                if(!$lazy) {
                    $children = self::buildTree($rows,$lazy,$row['id']);
                    if ($children) {
                        $row['children'] = $children;
                    }
                }else {
                    $count = Category::find()->where(['status'=>1,'parentid'=>$row['id']])->count();
                    if($count > 0) {
                        $data['children'] = true;
                        $data['icon'] = 'glyphicon glyphicon-play';
                    }else {
                        $data['icon'] = 'glyphicon glyphicon-flash';
                    }
                }
                $current[] = $data;
            }
        }
        return $current;
    }

   /*将列表转为树*/
    public  static  function list2tree($items ,$parentKey='parent_id' ,$chilrenKey='children')
    {
           $temp=[];
            foreach ($items as $index=> $ii)
            {
                $temp[$ii['id']] = $ii;
            }
           // var_dump($temp);
            $tree = array();
            foreach($temp as $item){
                //var_dump($item);
                if(isset($temp[$item[$parentKey]])){
                    $temp[$item[$parentKey]][$chilrenKey][] = &$temp[$item['id']];
                }else{
                    $tree[] = &$temp[$item['id']];
                }
            }
           // var_dump($tree);  exit();
            return $tree;
      }


    /***
     * 将树转为列表 并且
     * @param $tree 传入的参数是树 不是树林
     * @param int $index
     * @return array
     */
      public  static  function  tree2list(&$tree , &$list)
      {
          $temp = $tree;
          unset($temp['children']);
          $list[] = $temp;

          if(isset($tree['children']))
          foreach ($tree['children'] as $node)
          {
             // echo $node['title'];
              self::tree2list($node,$list);
          }
      }


}

