<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

if(!defined('SI_ELEMENTOR_MODULE_PATH')){
	define ('SI_ELEMENTOR_MODULE_PATH', dirname(__FILE__));
}


// include ELEMENTOR widgets
include SI_ELEMENTOR_MODULE_PATH . "/class.module.php";

//include SI_ELEMENTOR_MODULE_PATH . "/widgets/index.php";
if(!function_exists('si_dummy_include')){
	function si_dummy_include($path){
		$filePath = SI_ELEMENTOR_MODULE_PATH . '/dummy-content/' . $path;
		if(file_exists($filePath)){

			$pathParts = explode('/', $path);

			$partClasses = ['si-part'];
			$partClasses[] = 'si-part-' . str_replace(['.php','_'],['','-'],$pathParts[1]);

			echo('<div class="' . implode(' ',$partClasses) .'">');
			include $filePath;
			echo('</div>');
		}
		
	}

}

