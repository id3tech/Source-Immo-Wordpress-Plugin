<?php
$ref_number = get_query_var( 'ref_number');
$ref_type = get_query_var( 'type' );

$layout = SourceImmo::current()->get_detail_layout('broker');

get_header();


SourceImmo::view('single/brokers_layouts/_schema',array('model' => $data));

?>
<div data-ng-controller="singleBrokerCtrl" data-ng-init="init('<?php echo($ref_number) ?>')" 
                class="si broker-single {{model.status}} {{model!=null?'loaded':''}}">
    
    <?php 
        if($layout->type=='custom_page'){
            // load page content
            do_action('si_render_page',$layout->page, 'Loading broker');
        }
        else{
            si_start_of_template("Loading broker");

            SourceImmo::view('single/brokers_layouts/' . $layout->type);
            
            si_end_of_template();
        }
    ?>
</div>



<script type="text/javascript">
var siBrokerData = <?php echo(json_encode($data)); ?>;
</script>
<?php
get_footer();