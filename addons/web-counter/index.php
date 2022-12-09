<?php
define('SI_WEB_COUNTER_ADDON_DIR', str_replace('\\', '/',dirname(__FILE__)));
define('SI_WEB_COUNTER_ADDON_URL', str_replace(SI_PLUGIN_DIR, SI_PLUGIN_URL, SI_WEB_COUNTER_ADDON_DIR ));

class siWebCounterAddon extends SourceImmoAddon{
    public $_addon_path = SI_WEB_COUNTER_ADDON_DIR;

    public function __construct(){
        $this->name = 'web-counter';
        $this->caption = 'WebCounter';
        $this->default_configuration = array(
            
            // Used method to display listings' details
            'counter_widget_display' => 'none', // embed|button
            // Timeout before switching back to local details (in sec)
            'track_visitors' => 'yes',
            'track_listing_events' => 'yes',
            'track_broker_events' => 'no',
            'track_office_events' => 'no',
            'track_agency_events' => 'no',
        );
    }

    public function register_hooks(){
        if (!is_admin() ){
            // Add a hook for listing 
            //add_filter('si_listing_content', array($this, 'render_listing_content'), 5, 3);

            add_action('wp_enqueue_scripts', [$this, 'register_resources']);

            //if($this->active_configs->listing_detail_display)
            add_action('wp_footer', function(){
                $trackedTypes = [];
                if($this->active_configs->track_listing_events == 'yes') $trackedTypes[] = 'listing';
                if($this->active_configs->track_broker_events == 'yes') $trackedTypes[] = 'broker';
                if($this->active_configs->track_office_events == 'yes') $trackedTypes[] = 'office';
                if($this->active_configs->track_agency_events == 'yes') $trackedTypes[] = 'agency';
                
                echo('<si-addon-webcounter-proxy track-visitors="' . $this->active_configs->track_visitors . '" track-item-types="' . implode(',', $trackedTypes) . '"></si-addon-webcounter-proxy>');
            });
        }
    }

    public function register_resources(){
        $script_version = filemtime(SI_WEB_COUNTER_ADDON_DIR . '/assets/scripts.js');
        $script_url = SI_WEB_COUNTER_ADDON_URL . '/assets/scripts.js';
        wp_enqueue_script( 'si-addon-webcounter-script', $script_url, ['si-public-app'], $script_version);

        
        $remoteScriptUrl = '//webcounters.id-3.net/scripts/stats.jquery.js';
        wp_enqueue_script( 'si-addon-webcounter-remote-script', $remoteScriptUrl, ['jquery'], true,true);
    }

}

SourceImmo::current()->addons->register(new siWebCounterAddon());