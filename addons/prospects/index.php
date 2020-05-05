<?php
define('SI_PROSPECTS_ADDON_DIR', str_replace('\\', '/',dirname(__FILE__)));
define('SI_PROSPECTS_ADDON_URL', str_replace(SI_PLUGIN_DIR, SI_PLUGIN_URL, SI_PROSPECTS_ADDON_DIR ));

class siProspectsAddon extends SourceImmoAddon{
    public $_addon_path = SI_PROSPECTS_ADDON_DIR;

    public function __construct(){
        $this->name = 'prospects';
        $this->caption = 'Prospects software';
        $this->default_configuration = array(
            // Token use to display forms
            'leadgrabber_token' => '',
        );

        
        
    }

    public function register_hooks(){
        if (!is_admin() ){
            // Add a style
            $style_version = filemtime(SI_PROSPECTS_ADDON_DIR . '/assets/styles.min.css');
            $style_url = SI_PROSPECTS_ADDON_URL . '/assets/styles.min.css';
            wp_enqueue_style( 'si-addon-prospect-style', $style_url, null, $style_version);
    
           
            // add_action('si_listing_single_start', array($this,'listing_single_start'),5,2);
            add_filter('si_listing_part_path',array($this,'listing_part_path_filter'),5,2);
            add_filter('si_listing_part_params',array($this,'listing_part_params_filter'),5,2);
        }
    }

    public function listing_part_path_filter($part_path, $part){
        if(in_array($part, array('info_request','info_request_modal'))){
            $part_path = SI_PROSPECTS_ADDON_DIR . "/views/single_listing_{$part}.php";
        }
        return $part_path;
    }

    public function listing_part_params_filter($part_params, $part){
        if($part == 'info_request'){
            $part_params = array('addon'=> $this);
        }
        return $part_params;
    }

    public function single_listing_lead_form($ref_number, $listing_data){
        include SI_PROSPECTS_ADDON_DIR . '/views/single_listing_lead_form.php';
    }

    public function get_iframe_url($ref_number){
        $style_version = filemtime(SI_PROSPECTS_ADDON_DIR . '/assets/frame_styles.min.css');
        $style_url = '//' . $_SERVER['SERVER_NAME'] . SI_PROSPECTS_ADDON_URL . '/assets/frame_styles.min.css?v=' . $style_version;
        $style_url = apply_filters('si_addon_prospects_leadgrabber_style_url', $style_url);

        $leadgrabber_url = '//www.prospectsweb.com/prospects/leadgrabber.do?' .
                            'tok=' . $this->active_configs->leadgrabber_token .
                            '&type=1' .
                            '&style_url=' . urlencode( $style_url ) .
                            '&SIA=' . $ref_number;
        return $leadgrabber_url;
    }
}

SourceImmo::current()->addons->register(new siProspectsAddon());