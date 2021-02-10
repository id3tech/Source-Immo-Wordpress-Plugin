<?php

add_action('si/listing/print:begin',function(){
    add_action('wp_enqueue_scripts', function(){
        wp_dequeue_style('avia-grid');
        wp_dequeue_style('avia-base');
        wp_deregister_style('avia-grid');
        wp_deregister_style('avia-base');
      }, 20 );
});