<?php

add_action('si/listing/print:begin',function(){
    add_action('wp_enqueue_scripts', function(){
        wp_dequeue_style('avia-grid');
        wp_dequeue_style('avia-base');
        wp_deregister_style('avia-grid');
        wp_deregister_style('avia-base');
      }, 20 );
});

add_filter('avf_markup_helper_attributes', function($attributes, $args){
  if($args['context'] == 'body'){
    $attributes = apply_filters('si/page-builder/body-attributes', $attributes);
  }

  return $attributes;
},2,5);

add_filter('si/page_builder/get_page_template', function($page_template){
  return 'page.php';
},1,5);

add_action('wp_enqueue_scripts', function(){
  wp_enqueue_style( 'si-mod-enfold-style', plugins_url('/modules/enfold/assets/style.min.css', SI_PLUGIN) );

});

// add_action('si/single-page-begin', function($controllerName){
//   // $ref_number = get_query_var( 'ref_number');
//   // $controller = "<div data-ng-controller=\"{$controllerName}\" data-ng-init=\"init('{$ref_number}')\">";

// });

// add_action('si/single-page-end', function(){
  
// });