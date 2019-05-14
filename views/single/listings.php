<?php
$ref_number = get_query_var( 'ref_number');
$ref_type = get_query_var( 'type' );
$layout = ImmoDB::current()->get_detail_layout('listing');

get_header();

ImmoDB::view('single/listings_layouts/_schema',array('model' => $data));

$contentClass = ($layout->type == 'custom_page') ? "immodb-custom-content" : "immodb-content";
?>

<div data-ng-controller="singleListingCtrl" data-ng-init="init('<?php echo($ref_number) ?>')" 
    class="immodb listing-single {{model.status}} {{model!=null?'loaded':''}}">

    <?php 
        $layout = ImmoDB::current()->get_detail_layout('listing');
        if($layout->type=='custom_page'){
            // load page content
            do_action('immodb_render_page',$layout->page);
        }
        else{
            immodb_start_of_template("Loading listing");

            ImmoDB::view('single/listings_layouts/' . $layout->type);
            
            immodb_end_of_template();
        }
    ?>
    
</div>

<script type="text/javascript">
var immodbListingData = <?php 
    echo(json_encode($data)); 
?>;
</script>
<?php
get_footer();
