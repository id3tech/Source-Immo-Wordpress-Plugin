<div class="immodb-list-header">
<?php

if($configs->show_list_meta){
    ImmoDB::view("list/brokers/standard/list-meta",
        array("configs" => $configs));
}

if($configs->sortable){ ImmoDB::view('list/brokers/sort'); }
    
if($configs->mappable){ 
    ImmoDB::view('list/brokers/switch'); 
}
?>
 </div>