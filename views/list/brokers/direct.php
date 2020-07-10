<?php 
extract( shortcode_atts(
    array(
        'side_scroll' => false
    ), $sc_atts )
);
unset($sc_atts['side_scroll']);

$global_container_classes = array('si', 'direct-layout', "si-list-of-{$configs->type}",$configs->list_layout->scope_class);
$global_container_attr = array();

global $dictionary;

$meta = SourceImmoApi::get_list_meta($configs);


$dictionary = new SourceImmoDictionary($meta->dictionary);
$data = SourceImmoApi::get_data($configs, $sc_atts);

$resultView = new SourceImmoBrokersResult($data);

$list_styles = array();
$list_attrs = [];
if($side_scroll){
    $list_attrs[] = 'si-side-scroll';
    $configs->list_layout->item_row_space->mobile = $configs->list_layout->item_row_space->desktop;
}

foreach ($configs->list_layout->item_row_space as $key => $value) {
    $width = round(100 / $value);
    $list_styles[] = "--{$key}-column-width:{$width}";
}
?>

<div class="<?php echo(implode(' ' , $global_container_classes)) ?>" 
    style="<?php echo(implode(';', $list_styles)) ?>" 
    <?php echo(implode(' ', $list_attrs)) ?>
    si-lazy-load>
    <?php
    SourceImmo::staticDataController($configs, $resultView->brokers);

    
    if(is_array($resultView->brokers) && !empty($resultView->brokers)){
        if($configs->show_list_meta==true){
            SourceImmo::view("list/{$configs->type}/direct/list-meta",
                array("configs" => $configs, "global_meta" => $meta, "result"=> $resultView));
        }

        if($configs->list_item_layout->preset=='custom'){
            echo('<style>');
            $styles = explode("\n",$configs->list_item_layout->custom_css);
            foreach ($styles as $style) {
                echo('.si-list .si-item .item-content ' . $style);
            }
            echo('</style>');
        }

        echo('<div class="si-list">');
            
            foreach ($resultView->brokers as $item) {
                echo('<div>');
                SourceImmo::view("list/{$configs->type}/direct/item-{$configs->list_item_layout->layout}", 
                    array("configs" => $configs, "item" => $item, "dictionary"=> $dictionary));
                echo('</div>');
            }
        
        echo('</div>');
    }
    else{
        echo('<label class="placeholder si-list-empty">');
        _e('No broker to display', SI);
        echo('</label>');
    }
    ?>
</div>