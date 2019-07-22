<?php

class SIGravityFormsConnector{

    public function __construct(){
        // add hook
        add_filter('si-get-form-list', array($this,'get_form_list'), 10,1);
        
        add_action('si-render-form', array($this, 'render_form'), 10, 2);
        
        add_action('wp_enqueue_scripts', array($this, 'register_clients'));
    }

    public function get_form_list($list){
        if(!is_array($list)) $list = array();

        $forms = GFAPI::get_forms();
        foreach($forms as $form){
            $list[] = array (
                'id' => $form['id'],
                'title' => $form['title'],
                'type' => 'gravity_form',
                'source' => $form
            );
        }

        return $list;
    }

    
    function register_clients(){
        wp_enqueue_script( 
                            'si-gravity-form-script',
                            plugins_url('/modules/forms/scripts/gravity-form.js', SI_PLUGIN),
                            array('si-public-app'), 
                            filemtime(SI_PLUGIN_DIR . '/modules/forms/scripts/gravity-form.js'),
                            true
                        );
    }

    function render_form($type, $form_id){
        if($type != 'gravity_form') return;
        
        echo '<si-gravity-form-module form-id="' . $form_id . '">';
        echo do_shortcode('[gravityform id="' . $form_id . '" title="false" description="false" ajax="true"]');
        echo '</si-gravity-form-module>';
    }


}

new SIGravityFormsConnector();