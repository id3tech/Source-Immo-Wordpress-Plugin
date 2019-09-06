<?php
$global_container_classes = array('si', 'direct-layout', "si-list-of-{$configs->type}",$configs->list_layout->scope_class);
$global_container_attr = array();

global $dictionary;

$meta = SourceImmoApi::get_list_meta($configs);


$dictionary = new SourceImmoDictionary($meta->dictionary);

$data = SourceImmoApi::get_data($configs, $sc_atts);
$resultView = new SourceImmoOfficesResult($data);

?>
<div class="<?php echo(implode(' ' , $global_container_classes)) ?>" >
    <?php
    if(is_array($resultView->offices) && !empty($resultView->offices)){

        

        if($configs->show_list_meta==true){
            SourceImmo::view("list/{$configs->type}/direct/list-meta",
                array("configs" => $configs, "global_meta" => $meta, "result"=> $resultView));
        }
        
        echo('<div class="si-list">');
            foreach ($resultView->offices as $item) {
                echo('<div>');
                SourceImmo::view("list/{$configs->type}/direct/item-{$configs->list_item_layout->preset}", 
                    array("configs" => $configs, "item" => $item, "dictionary"=> $dictionary));
                echo('</div>');
            }
        echo('</div>');
    }
    else{
        echo('<label class="placeholder si-list-empty">');
        _e('No office to display', SI);
        echo('</label>');
    }
    ?>
</div>