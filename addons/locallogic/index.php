<?php
define('SI_LOCALLOGIC_ADDON_DIR', str_replace('\\', '/',dirname(__FILE__)));
define('SI_LOCALLOGIC_ADDON_URL', str_replace(SI_PLUGIN_DIR, SI_PLUGIN_URL, SI_LOCALLOGIC_ADDON_DIR ));

class siLocalLogicAddon extends SourceImmoAddon{
    public $_addon_path = SI_LOCALLOGIC_ADDON_DIR;

    public function __construct(){
        $this->name = 'locallogic';
        $this->caption = 'Local logic';
        $this->default_configuration = array(
            // Token use to display forms
            'sdk_token' => '',
        );

        
        
    }

    public function register_hooks(){
        if (!is_admin() ){
            // Add a style
            $style_version = filemtime(SI_LOCALLOGIC_ADDON_DIR . '/assets/styles.min.css');
            $style_url = SI_LOCALLOGIC_ADDON_URL . '/assets/styles.min.css';
            wp_enqueue_style( 'si-addon-locallogic-style', $style_url, null, $style_version);
    
            $script_version = filemtime(SI_LOCALLOGIC_ADDON_DIR . '/assets/scripts.js');
            $script_url = SI_LOCALLOGIC_ADDON_URL . '/assets/scripts.js';
            wp_enqueue_script( 'si-addon-locallogic-script', $script_url, ['si-public-app'], $script_version);

            if(!str_null_or_empty($this->active_configs->sdk_token)){
                $remoteScriptUrl = 'https://cdn.locallogic.co/sdk/?token=' . $this->active_configs->sdk_token . '&callback=siInitLocallogic';
                wp_enqueue_script( 'si-addon-locallogic-remote-script', $remoteScriptUrl, ['jquery'], true,true);
            }
            // add_action('si_listing_single_start', array($this,'listing_single_start'),5,2);
            add_filter('si_listing_part_path',array($this,'listing_part_path_filter'),5,2);
            add_filter('si_listing_part_params',array($this,'listing_part_params_filter'),5,2);
        }
    }

    public function listing_part_path_filter($part_path, $part){
        if(in_array($part, array('neighborhood'))){
            if(!str_null_or_empty($this->active_configs->sdk_token)){
                $part_path = SI_LOCALLOGIC_ADDON_DIR . "/views/single_listing_{$part}.php";
            }
        }
        return $part_path;
    }

    public function listing_part_params_filter($part_params, $part){
        if($part == 'neighborhood'){
            $part_params = array('addon'=> $this);
        }
        return $part_params;
    }

}

//SourceImmo::current()->addons->register(new siLocalLogicAddon());