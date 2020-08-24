<?php

namespace SI\Bases;

class Module{

    public $_module_path = '';

    public function register_actions(){}
    public function register_filters(){}
    
    public function includes(){}

    public function get_script_depends() {
    	return [ ];
    }

    public function get_style_depends() {
    	return [ ];
    }

    public function register_locales(){
        if(file_exists($this->_module_path . '/locales/')){
            add_filter('si-locale-file-paths', array($this,'add_locale_files'),5,1);
        }
    }

    
    public function add_locale_files($files){
        $lTwoLetterLocale = si_get_locale();
        if(file_exists($this->_module_path . "/locales/module.{$lTwoLetterLocale}.js")){
            $files[] = $this->_module_path . "/locales/module.{$lTwoLetterLocale}.js";
        }

        return $files;
    }

}