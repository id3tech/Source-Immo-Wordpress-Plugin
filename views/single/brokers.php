<?php
$ref_number = get_query_var( 'ref_number');
$ref_type = get_query_var( 'type' );

$pageBuilder = new SourceImmoPageBuilder('broker');


$pageBuilder->start_page();

// $layout = SourceImmo::current()->get_detail_layout('broker');

// get_header();


SourceImmo::view('single/brokers_layouts/_schema',array('model' => $data));

?>
<div data-ng-controller="singleBrokerCtrl" data-ng-init="init('<?php echo($ref_number) ?>')" 
                class="si broker-single {{model.status}} {{model!=null?'loaded':''}}">
    
    <?php 
        if($pageBuilder->layout->type=='custom_page'){
            // load page content
            do_action('si_render_page',$pageBuilder->layout->page, 'Loading broker');
        }
        else{
            do_action('si_start_of_template',"Loading broker" );
            

            SourceImmo::view('single/brokers_layouts/' . $pageBuilder->layout->type);
            
            do_action('si_end_of_template');
        }
    ?>
</div>



<script type="text/javascript">
var siBrokerData = <?php echo(json_encode($data)); ?>;
</script>
<?php
$pageBuilder->close_page();
$pageBuilder->render();