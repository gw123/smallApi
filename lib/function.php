<?php

function  _get($name ,$default='' , $type='string')
{
   if( isset( $_GET[$name] ))
   {
       switch ( $type)
       {
           case 'string' : return  strval($_GET[$name]);
           case 'intval' : return  intval($_GET[$name]);
           case 'float'  : return  floatval($_GET[$name]);
           return $default;
       }
   }else{
       return $default;
   }

}

function  _post($name ,$default='', $type='string')
{
    if( isset( $_POST[$name] ))
    {
        switch ( $type)
        {
            case 'string' : return  strval($_POST[$name]);
            case 'intval' : return  intval($_POST[$name]);
            case 'float'  : return  floatval($_POST[$name]);
                return $default;
        }
    }else{
        return $default;
    }
}
