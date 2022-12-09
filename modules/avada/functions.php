<?php
function avada_page_builder_prerender($page_id){
    if(class_exists('Avada_Dynamic_CSS')){
        if(method_exists('Avada_Dynamic_CSS','file')){
            wp_enqueue_style( 'avada-dynamic-css', Avada_Dynamic_CSS::file( 'uri' ), array( 'avada-stylesheet' ) );
        }
    }
}
add_action('si_page_builder_prerender', 'avada_page_builder_prerender');

add_filter('si/page-builder/body-start', function($actions){
    return ['avada_before_body_content'];
});
