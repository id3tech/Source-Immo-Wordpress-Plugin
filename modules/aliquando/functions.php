<?php

// Add body attributes filter for details pages
add_filter('aliquando/body/attributes', function($attributes){
    return apply_filters('si/page-builder/body-attributes',$attributes);
});