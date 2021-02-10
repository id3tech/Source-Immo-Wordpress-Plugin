<?php

define('SI_ADDONS_PATH', SI_PLUGIN_DIR . 'addons/');

class SourceImmoAddons{

    public $items = array();
    
    public function __construct(){
        
    }

    public function load(){
        if(file_exists(SI_ADDONS_PATH)){   
            foreach (glob(SI_ADDONS_PATH . '*') as $file) {
                
                if(file_exists($file . '/index.php')){
                    include_once($file . '/index.php');
                }

            }
        }
    }

    public function register($addon){
        $this->items[] = $addon;

        $addon->register_locales();
    }

    public function any(){
        return count($this->items) > 0;
    }

    public function register_hooks($active_addons){
        if($active_addons == null) return;
        
        foreach($this->items as $addon){
            if(array_key_exists($addon->name, $active_addons)){
                $addon->active_configs = $active_addons->{$addon->name}->configs;
                $addon->register_hooks();
            }
        }
    }
}


class SourceImmoAddon{

    public $_addon_path = '';
    public $name = '';
    public $caption = '';
    public $default_configuration = null;

    public function __construct(){

    }

    public function register_hooks(){}


    public function register_locales(){
        if(file_exists($this->_addon_path . '/locales/')){
            add_filter('si-locale-file-paths', array($this,'add_locale_files'),5,1);
        }
    }

    
    public function add_locale_files($files){
        $lTwoLetterLocale = si_get_locale();
        if(file_exists($this->_addon_path . "/locales/addon.{$lTwoLetterLocale}.js")){
            $files[] = $this->_addon_path . "/locales/addon.{$lTwoLetterLocale}.js";
        }

        return $files;
    }
}