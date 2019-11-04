<?php
$ref_number = get_query_var( 'ref_number');
$ref_type = get_query_var( 'type' );

$pageBuilder = new SourceImmoPageBuilder('listing');

$pageBuilder->start_page();

SourceImmo::view('single/listings_layouts/_schema',array('model' => $data));

$contentClass = ($pageBuilder->layout->type == 'custom_page') ? "si-custom-content" : "si-content";
?>

<div data-ng-controller="singleListingCtrl" data-ng-init="init('<?php echo($ref_number) ?>')" 
    class="si listing-single {{model.status}} {{model!=null?'loaded':''}}">

    <?php 
        if($pageBuilder->layout->type=='custom_page'){
            // load page content
            do_action('si_render_page',$pageBuilder->layout->page,"Loading listing");
        }
        else{
            do_action('si_start_of_template',"Loading listing" );
            //
            
            SourceImmo::view('single/listings_layouts/' . $pageBuilder->layout->type);
            
            do_action('si_end_of_template');

            //si_end_of_template();
        }
    ?>
    
</div>
<?php 
if(SourceImmo::current()->configs->prefetch_data){
?>
<script type="text/javascript">
var siListingData = <?php 
    echo(json_encode($data)); 
?>;
</script>
<?php
}
$pageBuilder->close_page();
$pageBuilder->render();
