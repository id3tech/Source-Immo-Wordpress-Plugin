<div class="immodb-list-header">
<?php

if($configs->show_list_meta){
    ImmoDB::view("list/listings/standard/list-meta",
        array("configs" => $configs));
}

if($configs->sortable){ ImmoDB::view('list/listings/sort'); }
    
if($configs->mappable){ 
    ImmoDB::view('list/switch'); 
}
?>
 </div>

 <?php
 if($configs->mappable){ 
    ImmoDB::view("list/listings/map", array(
                    "configs" => $configs
                ));
}