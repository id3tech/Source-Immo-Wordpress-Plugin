<?php
$ref_number = get_query_var( 'ref_number');
$ref_type = get_query_var( 'type' );

get_header();
?>
<div class="wrap">
	<div id="primary" class="content-area">
		<main id="main" class="site-main" role="main">
            <div ng-controller="singleBrokerCtrl" ng-init="init('<?php echo($ref_number) ?>')" 
                class="immodb broker-single {{model.status}} {{model!=null?'loaded':''}}">
                <label class="placeholder"  ng-show="model==null"><?php _e('Loading broker',IMMODB) ?> <i class="fal fa-spinner fa-spin"></i></label>
                <div class="content">
            <?php 
                $layout = ImmoDB::current()->configs->broker_layout;
                if($layout=='custom_page'){
                    // load page content
                    $lPost = get_post(ImmoDB::current()->configs->broker_layout_page);
                    echo(do_shortcode($lPost->post_content));
                }
                else{
                    ImmoDB::view('single/brokers_layouts/' . $layout);
                }
            ?>
                </div>
            </div>
        </main>
    </div>
</div>
<script type="text/javascript">
var immodbBrokerData = JSON.parse(<?php echo(json_encode($data)); ?>);
</script>
<?php
get_footer();