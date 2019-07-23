<?php
class SIContactForm7Connector{

    public function __construct(){
        // add filters after all plugins are loaded
        add_action('plugins_loaded', array($this, 'plugins_loaded'));
        // Hook to render the form
        add_action('si-render-form', array($this, 'render_form'), 10, 2);
        // Add module clients files
        add_action('wp_enqueue_scripts', array($this, 'register_clients'));
    }

    public function plugins_loaded(){
        if(!class_exists('WPCF7_ContactForm')) return;

        add_filter('si-get-form-list', array($this,'get_form_list'), 10,1);
        
    }

    public function get_form_list($list){
        if(!is_array($list)) $list = array();

        // query
        $posts = new WP_Query( array(
            'post_type' => array('wpcf7_contact_form'),
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'sort_order' => 'asc',
            'sort_column' => 'post_title',
            'hierarchical' => 1,
            'suppress_filters' => false
        ) );

        $forms = $posts->posts;
        foreach ($forms as &$form) {
            $list[] = array(
                'id' => $form->ID,
                'title' => $form->post_title,
                'type' => 'wpcf7_contact_form',
                'source' => $form
            );
        }

        return $list;
    }

    function form_action_url($url){
        return '//' . $_SERVER['HTTP_HOST'];
    }

    function register_clients(){
        if(!class_exists('WPCF7_ContactForm')) return;
        wp_enqueue_script( 
                            'si-wpcf7-script',
                            plugins_url('/modules/forms/scripts/contact-form-7.js', SI_PLUGIN),
                            array('si-public-app'), 
                            filemtime(SI_PLUGIN_DIR . '/modules/forms/scripts/contact-form-7.js'),
                            true
                        );
        
    }

    function render_form($type, $form_id){
        if($type != 'wpcf7_contact_form') return;

        echo '<si-wpcf7-module form-id="' . $form_id . '">';
        echo do_shortcode('[contact-form-7 id="' . $form_id . '"]');
        echo '</si-wpcf7-module>';
    }

}

new SIContactForm7Connector();