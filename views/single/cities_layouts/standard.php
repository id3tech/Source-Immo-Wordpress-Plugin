<h1><?php echo StringPrototype::format(__('Listings in {0}',SI), $model['name'])?></h1>
<?php 
 echo do_shortcode('[si alias="'. $model['alias'] . '" layout="direct" show_list_meta="false" location__city_code="' . $model['ref_number'] .'"]'); 
 
 