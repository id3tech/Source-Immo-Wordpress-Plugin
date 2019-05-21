<div class="si-list-header">
<?php

if($configs->show_list_meta){
    SourceImmo::view("list/brokers/standard/list-meta",
        array("configs" => $configs));
}

if($configs->sortable){ SourceImmo::view('list/brokers/sort'); }
    
if($configs->mappable){ 
    SourceImmo::view('list/brokers/switch'); 
}
?>
 </div>