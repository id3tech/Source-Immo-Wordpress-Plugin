<?php
define('SI_REMAX_QUEBEC_ADDON_DIR', dirname(__FILE__));

class siRemaxQuebecAddon extends SourceImmoAddon{
    public $_addon_path = SI_REMAX_QUEBEC_ADDON_DIR;

    public function __construct(){
        $this->name = 'remax-quebec';
        $this->caption = 'Remax-Québec';
        $this->default_configuration = array(
            // Used method to display listings' details
            'listing_detail_display' => 'embed', // embed|button
            // Loading text while waiting for server to responds
            'loading_text' => 'Connecting to RE/MAX Québec server',
            // Timeout before switching back to local details (in sec)
            'switch_timeout' => 5
        );

        
        
    }

    public function register_hooks(){
        if (!is_admin() ){
            // Add a hook for listing 
            //add_filter('si_listing_content', array($this, 'render_listing_content'), 5, 3);

            add_action('si_listing_single_start', array($this,'listing_single_start'),5,2);
            add_action('si_listing_single_end', array($this,'listing_single_end'),5,0);
        }
    }


    public function listing_single_start($ref_number, $listing_data){
        if($this->active_configs->listing_detail_display == 'embed'){
            include SI_REMAX_QUEBEC_ADDON_DIR . '/views/embed_listing_details.php';

            echo('<div id="local-details" style="display:none">');
        }
    }

    public function listing_single_end(){
        echo '</div>';
    }

    public function render_listing_content($content, $ref_number, $listing_data){
        $oldContent = $content;

        if($this->active_configs->listing_detail_display == 'embed'){   
            ob_start();

            include SI_REMAX_QUEBEC_ADDON_DIR . '/views/embed_listing_details.php';

            $content = ob_get_contents();
            ob_end_clean();        
        }

        return $oldContent . $content;
    }

    public function get_iframe_url($ref_number, $listing_data){
        $lUrl = str_replace('http://','//', $listing_data->links->website);

        $lShareUrl = "//$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
        $lUls = preg_replace('/\D/','',$ref_number);
        $lSha = sha1("kaluxo" . "rmx5abb0a19" . $lUls);
        $lResult = $lUrl . '?model=new&from=kaluxo&key=' . $lSha . '&pub=0&desjPub=0&shareUrl=' . urlencode($lShareUrl);

        return $lResult;
    }
}

SourceImmo::current()->addons->register(new siRemaxQuebecAddon());