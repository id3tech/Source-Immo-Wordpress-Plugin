<?php
$ref_number = get_query_var( 'ref_number');
$ref_type = get_query_var( 'type' );

get_header();
?>
<div class="wrap">
	<div id="primary" class="content-area">
		<main id="main" class="site-main" role="main">
            <div 
                class="immodb listing-single not-found">
            <?php 
                $layout = ImmoDB::current()->get_detail_layout('listing_not_found');
                if($layout != null && $layout->type=='custom_page'){
                    // load page content
                    $lPost = get_post($layout->page);
                    echo(do_shortcode($lPost->post_content));
                }
                else{
                ?>
                    <h2><?php _e("Sorry, this property listing could not be found.",IMMODB) ?></h2>
                    <p><?php _e("It's possible that this property no longer exists or the link you used to access this page is invalid.",IMMODB) ?></p>
                <?php
                }
            ?>
                </div>
            </div>
        </main>
    </div>
</div>
<?php
get_footer();
