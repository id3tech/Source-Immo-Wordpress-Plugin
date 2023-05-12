<div class="si-list-header">
<?php

if($configs->sortable){ SourceImmo::view('list/listings/sort'); }
 

if($configs->show_list_meta){
    SourceImmo::view("list/listings/standard/list-meta",
        array("configs" => $configs));
}
   
if($configs->mappable){ 
    SourceImmo::view('list/listings/switch'); 
}
?>
 </div>