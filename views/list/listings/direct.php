<?php 
//Debug::write($configs);
$global_container_classes = array('immodb', 'direct-layout', "immodb-list-of-{$configs->type}",$configs->list_layout->scope_class);
$global_container_attr = array();

global $dictionary;

$meta = ImmoDBApi::get_list_meta($configs);


$dictionary = new ImmoDBDictionary($meta->dictionary);
$data = ImmoDBApi::get_data($configs);
$resultView = new ImmoDBListingsResult($data);


?>
<div class="<?php echo(implode(' ' , $global_container_classes)) ?>" >
    <?php
    if(is_array($resultView->listings) && !empty($resultView->listings)){
        if($configs->show_list_meta==true){
            ImmoDB::view("list/{$configs->type}/direct/list-meta",
                array("configs" => $configs, "global_meta" => $meta, "result"=> $resultView));
        }
        

        echo('<div class="immodb-list">');
            
            foreach ($resultView->listings as $item) {
                echo('<div>');
                ImmoDB::view("list/{$configs->type}/direct/item-{$configs->list_item_layout->preset}", 
                    array("configs" => $configs, "item" => $item, "dictionary"=> $dictionary));
                echo('</div>');
            }
        
        echo('</div>');
    }
    else{
        echo('<div class="immodb-placeholder immodb-list-empty">');
        _e('The list is empty', IMMODB);
        echo('</div>');
    }
    ?>
</div>