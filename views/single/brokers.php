<?php
$ref_number = get_query_var( 'ref_number');
$ref_type = get_query_var( 'type' );

get_header();


ImmoDB::view('single/brokers_layouts/_schema',array('model' => $data));

?>
<div class="wrap">
    <div id="primary" class="content-area">
        <main id="main" class="site-main" role="main">
            <div class="container">
            <div data-ng-controller="singleBrokerCtrl" data-ng-init="init('<?php echo($ref_number) ?>')" 
                class="immodb broker-single {{model.status}} {{model!=null?'loaded':''}}">
                <label class="placeholder"  data-ng-show="model==null"><?php _e('Loading broker',IMMODB) ?> <i class="fal fa-spinner fa-spin"></i></label>
                <div class="immodb-content">
                <?php 
                    $layout = ImmoDB::current()->get_detail_layout('broker');
                    if($layout->type=='custom_page'){
                        // load page content
                        $lPost = get_post($layout->page);
                        echo(do_shortcode($lPost->post_content));
                    }
                    else{
                        ImmoDB::view('single/brokers_layouts/' . $layout->type);
                    }
                ?>
                </div>
            </div>
            </div>
        </main>
    </div>
</div>



<script type="text/javascript">
var immodbBrokerData = <?php echo(json_encode($data)); ?>;
</script>
<?php
get_footer();