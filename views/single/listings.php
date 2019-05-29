<?php
$ref_number = get_query_var( 'ref_number');
$ref_type = get_query_var( 'type' );
$layout = SourceImmo::current()->get_detail_layout('listing');

get_header();

SourceImmo::view('single/listings_layouts/_schema',array('model' => $data));

$contentClass = ($layout->type == 'custom_page') ? "si-custom-content" : "si-content";
?>

<div data-ng-controller="singleListingCtrl" data-ng-init="init('<?php echo($ref_number) ?>')" 
    class="si listing-single {{model.status}} {{model!=null?'loaded':''}}">

    <?php 
        $layout = SourceImmo::current()->get_detail_layout('listing');
        if($layout->type=='custom_page'){
            // load page content
            do_action('si_render_page',$layout->page,"Loading listing");
        }
        else{
            do_action('si_start_of_template',"Loading listing" );
            //
            
            SourceImmo::view('single/listings_layouts/' . $layout->type);
            
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

get_footer();
