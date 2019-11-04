<?php
$ref_number = get_query_var( 'ref_number');
$ref_type = get_query_var( 'type' );


$pageBuilder = new SourceImmoPageBuilder('office');

$pageBuilder->start_page();


//SourceImmo::view('single/offices_layouts/_schema',array('model' => $data));

?>
<div data-ng-controller="singleOfficeCtrl" data-ng-init="init('<?php echo($ref_number) ?>')" 
                class="si office-single {{model.status}} {{model!=null?'loaded':''}}">
    
    <?php 
        if($pageBuilder->layout->type=='custom_page'){
            // load page content
            do_action('si_render_page',$pageBuilder->layout->page, 'Loading office');
        }
        else{
            do_action('si_start_of_template',"Loading office" );

            SourceImmo::view('single/offices_layouts/' . $pageBuilder->layout->type);
            
            do_action('si_end_of_template');
        }
    ?>
</div>



<script type="text/javascript">
var siOfficeData = <?php echo(json_encode($data)); ?>;
</script>
<?php
$pageBuilder->close_page();
$pageBuilder->render();
