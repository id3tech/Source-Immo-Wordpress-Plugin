<?php
$ref_number = get_query_var( 'ref_number');
$ref_type = get_query_var( 'type' );

get_header();
?>
<div class="wrap">
	<div id="primary" class="content-area">
		<main id="main" class="site-main" role="main">
            <div ng-controller="singleListingCtrl" ng-init="init('<?php echo($ref_type) ?>','<?php echo($ref_number) ?>')" 
                class="immodb listing-single {{model.status}} {{model!=null?'loaded':''}}">
                <label class="placeholder"  ng-show="model==null"><?php _e('Loading property',IMMODB) ?> <i class="fal fa-spinner fa-spin"></i></label>
                <div class="content">
            <?php 
                $layout = ImmoDB::current()->configs->listing_layout;
                if($layout=='custom_page'){
                    // load page content
                }
                else{
                    ImmoDB::view('single/listings_layouts/' . $layout);
                }
            ?>
                </div>
            </div>
        </main>
    </div>
</div>
<?php
get_footer();
