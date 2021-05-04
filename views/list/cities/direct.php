<?php
$global_container_classes = array('si', 'direct-layout', "si-list-of-{$configs->type}",$configs->list_layout->scope_class);
$global_container_attr = array();

global $dictionary;

$meta = SourceImmoApi::get_list_meta($configs);


$dictionary = new SourceImmoDictionary($meta->dictionary);

$data = SourceImmoApi::get_data($configs, $sc_atts);
$resultView = new SourceImmoCitiesResult($data);

?>
<div class="<?php echo(implode(' ' , $global_container_classes)) ?>" >
    <?php
    if(is_array($resultView->cities) && !empty($resultView->cities)){
        if($configs->show_list_meta==true){
            SourceImmo::view("list/{$configs->type}/direct/list-meta",
                array("configs" => $configs, "global_meta" => $meta, "result"=> $resultView));
        }

        echo('<div class="si-list">');
            foreach ($resultView->cities as $item) {
                echo('<div>');
                SourceImmo::view("list/{$configs->type}/direct/item-{$configs->list_item_layout->layout}", 
                    array("configs" => $configs, "item" => $item, "dictionary"=> $dictionary));
                echo('</div>');
            }
        echo('</div>');
    }
    else{
        echo('<label class="placeholder si-list-empty">');
        echo(apply_filters('si_label', __('No city to display', SI)));
        echo('</label>');
    }
    ?>
</div>