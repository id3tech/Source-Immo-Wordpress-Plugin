<?php
$ref_number = get_query_var( 'ref_number');
$ref_type = get_query_var( 'type' );

get_header();
?>

<div class="wrap">
    <div id="primary" class="content-area">
        <main id="main" class="site-main" role="main">
            <div class="si broker-single not-found">
            <?php
            $layout = SourceImmo::current()->get_detail_layout('broker_not_found');
            if($layout!=null && $layout->type =='custom_page'){
                $lPost = get_post($layout->page);
                ob_start();
                echo(do_shortcode($lPost->post_content));
                $lPageContent = ob_get_clean();
                echo($lPageContent);
            }
            else{
            ?>
                <h2><?php _e("Sorry, this broker could not be found.",SI) ?></h2>
                <p><?php _e("It's possible that this broker is no longer member of the team or the link you used to access this page is invalid.",SI) ?></p>
            <?php
            }
            ?>
            </div>
        </main>
    </div>
</div>

<?php    
get_footer();