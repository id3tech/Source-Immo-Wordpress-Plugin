<?php

$ref_number = get_query_var( 'ref_number');
$ref_type = get_query_var( 'type' );

$lListConfig = SourceImmo::current()->get_default_list('listings');
$lAlias = 'default';
if($lListConfig!=null){
    $lAlias = $lListConfig->alias;
}
$city_name = $data->name;

get_header();

?>
<div class="wrap container">
    <div id="primary" class="content-area">
        <main id="main" class="site-main" role="main">
            <h1><?php echo StringPrototype::format(__('Listings in {0}',SI), $city_name)?></h1>
            <?php echo do_shortcode('[si alias="'. $lAlias . '" layout="direct" show_list_meta="false" location__city_code="' . $ref_number .'"]'); ?>
        </main>
    </div>
</div>
<?php
get_footer();