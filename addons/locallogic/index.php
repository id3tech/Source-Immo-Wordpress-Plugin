<?php
define('SI_LOCALLOGIC_ADDON_DIR', str_replace('\\', '/',dirname(__FILE__)));
define('SI_LOCALLOGIC_ADDON_URL', str_replace(SI_PLUGIN_DIR, SI_PLUGIN_URL, SI_LOCALLOGIC_ADDON_DIR ));
define('SI_LOCALLOGIC_API_BASE', 'https://api.locallogic.co/v2/');

class siLocalLogicAddon extends SourceImmoAddon{
    public $_addon_path = SI_LOCALLOGIC_ADDON_DIR;
    
    public function __construct(){
        $this->name = 'locallogic';
        $this->caption = 'Local logic';
        $this->default_configuration = array(
            // Token use to display forms
            'sdk_token' => '',
            'allow_demographic' => false
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

        add_shortcode('ll_demographics', [$this, 'render_demographics_shortcode']);
    }

    public function listing_part_path_filter($part_path, $part){
        if(in_array($part, array('neighborhood','demographics'))){
            if(!str_null_or_empty($this->active_configs->sdk_token)){
                if($part == 'demographics' && $this->active_configs->allow_demographic !== true) return $part_path;
                $part_path = SI_LOCALLOGIC_ADDON_DIR . "/views/single_listing_{$part}.php";
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

    public function render_demographics_shortcode($atts, $content=null){
        // Extract attributes to local variables
        extract( shortcode_atts(
            array(
                'lat' => 0,
                'lng' => 0,
                'class' => ''
            ), $atts )
        );

        if($lat == 0 || $lng == 0) return '';
        if(str_null_or_empty($this->active_configs->sdk_token)) return '';

        ob_start();

        $data = $this->apiCall('GET','demographics', [
            'lat'   => $lat,
            'lng'   => $lng,
            'lang'  => 'fr',
            'key'   => $this->active_configs->sdk_token
        ]);

        include 'views/demographics.php';

        $result = ob_get_contents();
        ob_end_clean();

        return $result;
    }

    public function apiCall($method,$endpoint,$params = null){
        $url = SI_LOCALLOGIC_API_BASE. $endpoint;
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

SourceImmo::current()->addons->register(new siLocalLogicAddon());