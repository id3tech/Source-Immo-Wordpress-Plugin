<?php
define('SI_LOCALLOGIC3_ADDON_DIR', str_replace('\\', '/',dirname(__FILE__)));
define('SI_LOCALLOGIC3_ADDON_URL', str_replace(SI_PLUGIN_DIR, SI_PLUGIN_URL, SI_LOCALLOGIC3_ADDON_DIR ));
define('SI_LOCALLOGIC3_API_BASE', 'https://api.locallogic.co/v2/');

class siLocalLogic3Addon extends SourceImmoAddon{
    public $_addon_path = SI_LOCALLOGIC3_ADDON_DIR;
    
    public function __construct(){
        $this->name = 'locallogic3';
        $this->caption = 'Local logic v3';
        $this->default_configuration = array(
            // Token use to display forms
            'sdk_token' => ''
        );   
    }

    public function get_sdk_token(){
        return apply_filters('licenses/local_logic3', $this->active_configs->sdk_token);
    }

    public function register_hooks(){
        if (!is_admin() ){
            $token = $this->get_sdk_token();

            if(!str_null_or_empty($token)){
                // Add a style
                $style_version = filemtime(SI_LOCALLOGIC3_ADDON_DIR . '/assets/styles.min.css');
                $style_url = SI_LOCALLOGIC3_ADDON_URL . '/assets/styles.min.css';
                wp_enqueue_style( 'si-addon-locallogic3-style', $style_url, null, $style_version);
        
                $script_version = filemtime(SI_LOCALLOGIC3_ADDON_DIR . '/assets/scripts.js');
                $script_url = SI_LOCALLOGIC3_ADDON_URL . '/assets/scripts.js';
                wp_enqueue_script( 'si-addon-locallogic3-script', $script_url, ['si-public-app'], $script_version);

                
                // $remoteScriptUrl = 'https://cdn.locallogic.co/sdk/?token=' . $token . '&callback=siInitLocallogic';
                // wp_enqueue_script( 'si-addon-locallogic-remote-script', $remoteScriptUrl, ['jquery'], true,true);
            
                // add_action('si_listing_single_start', array($this,'listing_single_start'),5,2);
                add_filter('si_listing_part_path',array($this,'listing_part_path_filter'),5,2);
                add_filter('si_listing_part_params',array($this,'listing_part_params_filter'),5,2);
            }
        }
    }

    public function listing_part_path_filter($part_path, $part){
        if(in_array($part, array('neighborhood','demographics'))){
            $token = $this->get_sdk_token();

            if(!str_null_or_empty($token)){
                //if($part == 'demographics' && $this->active_configs->allow_demographic !== true) return $part_path;
                $part_path = SI_LOCALLOGIC3_ADDON_DIR . "/views/single_listing_{$part}.php";
            }
        }

        return $part_path;
    }

    public function listing_part_params_filter($part_params, $part){
        if(in_array($part, array('neighborhood','demographics'))){
            $part_params = array('addon'=> $this);
        }
        return $part_params;
    }

    public function apiCall($method,$endpoint,$params = null){
        $url = SI_LOCALLOGIC3_API_BASE. $endpoint;
        $args = [
            'method' => $method,
        ];

        if($method == 'GET' && $params != null){
            $url = $url . '?' . http_build_query($params);
        }
        else{
            $args['data'] = json_encode($params);
        }
        
        $response = wp_remote_request($url, $args);

        __c($url, $args, $response);
        return wp_remote_retrieve_body( $response );
    }
}

SourceImmo::current()->addons->register(new siLocalLogic3Addon());