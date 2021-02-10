<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

define ('SI_ELEMENTOR_MODULE_PATH', dirname(__FILE__));

// include ELEMENTOR widgets
include SI_ELEMENTOR_MODULE_PATH . "/class.module.php";

//include SI_ELEMENTOR_MODULE_PATH . "/widgets/index.php";
function si_dummy_include($path){
	$filePath = SI_ELEMENTOR_MODULE_PATH . '/dummy-content/' . $path;
	if(file_exists($filePath)){
		include $filePath;
	}
	
}



