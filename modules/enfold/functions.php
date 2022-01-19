<?php

add_action('si/listing/print:begin',function(){
    add_action('wp_enqueue_scripts', function(){
        wp_dequeue_style('avia-grid');
        wp_dequeue_style('avia-base');
        wp_deregister_style('avia-grid');
        wp_deregister_style('avia-base');
      }, 20 );
});

add_action('si/single-page-begin', function($controllerName){
  $ref_number = get_query_var( 'ref_number');
  $controller = "<div data-ng-controller=\"{$controllerName}\" data-ng-init=\"init('{$ref_number}')\">";

});

add_action('si/single-page-end', function(){
  
});