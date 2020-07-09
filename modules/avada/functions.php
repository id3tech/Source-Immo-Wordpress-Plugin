<?php
function avada_page_builder_prerender($page_id){
    if(class_exists('Avada_Dynamic_CSS')){
        wp_enqueue_style( 'avada-dynamic-css', Avada_Dynamic_CSS::file( 'uri' ), array( 'avada-stylesheet' ) );
    }
}
add_action('si_page_builder_prerender', 'avada_page_builder_prerender');

