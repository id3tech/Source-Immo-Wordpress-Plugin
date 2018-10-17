<?php
$ref_number = get_query_var( 'ref_number');
$ref_type = get_query_var( 'type' );

$lListConfig = ImmoDB::current()->get_default_list('listings');
$lAlias = 'default';
if($lListConfig!=null){
    $lAlias = $lListConfig->alias;
}

get_header();

?>
<div class="wrap">
    <div id="primary" class="content-area">
        <main id="main" class="site-main" role="main">
            <?php echo do_shortcode('[immodb alias="'. $lAlias . '" layout="direct" show_list_meta="false" location__city_code="' . $ref_number .'"]'); ?>
        </main>
    </div>
</div>
<?php
get_footer();