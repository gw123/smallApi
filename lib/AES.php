<?php
namespace  lib;
/**
 * 高级安全加密
 * @category	Lib
 * @package		AES
 * @author		zhaoshunyao
 * @date		2012/10/19
*/
class AES
{
	 private function pad2Length($text, $padlen)
	 {
		$len = strlen($text)%$padlen;
		$res = $text;
		$span = $padlen-$len;
		for($i=0; $i<$span; $i++)
		{
			$res .= chr($span);
		}
		return $res;
	}
	
	private function hexToStr($hex)
	{
		$bin = '';
		for($i=0; $i<strlen($hex)-1; $i+=2)    
		{
			$bin .= chr(hexdec($hex[$i].$hex[$i+1]));
		}
		return $bin;
	}

	private function trimEnd($text)
	{
		$text = rtrim($text);
		$len = strlen($text);
		$lc = $text[$len-1];
		$lcord = ord($lc);
		if($lcord < $len)
		{
			for($i = $len-$lcord; $i<$len; $i++)
			{
				if($text[$i] != $lc)
				{
					return $text;
				}
			}
			return substr($text, 0, $len-$lcord);
		}
		return $text;
	}

	public function encrypt($in, $key, $iv = null)
	{
		$ret = null;

		// The block-size of the AES algorithm is 256-bits, therefore our IV is always 32 bytes:
		$iv = str_pad($iv, 32, "\0");
		if (strlen($iv) > 32) $iv = substr($iv, 0, 32);
		
		$cipher = mcrypt_module_open('rijndael-256', '', 'ecb', '');
		if (mcrypt_generic_init($cipher, $key, $iv) != -1)
		{
			$ret = mcrypt_generic($cipher, $this->pad2Length($in, 32));
			mcrypt_generic_deinit($cipher);
		}
		mcrypt_module_close($cipher);
		unset($cipher);

		return bin2hex($ret);
	}

	public function decrypt($in, $key, $iv = null)
	{
		$ret = null;

		// The block-size of the AES algorithm is 256-bits, therefore our IV is always 32 bytes:
		$iv = str_pad($iv, 32, "0");
		if (strlen($iv) > 32) $iv = substr( $iv, 0, 32);

		$cipher = mcrypt_module_open('rijndael-256', '', 'ecb', '');
		if (mcrypt_generic_init($cipher, $key, $iv) != -1)
		{
			$ret = mdecrypt_generic($cipher, $this->hexToStr($in));
			mcrypt_generic_deinit($cipher);
		}
		mcrypt_module_close($cipher);
		unset($cipher);
	 
		return $this->trimEnd($ret);
	}
}

?>