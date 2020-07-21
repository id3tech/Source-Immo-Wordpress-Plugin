<?php
$tabArray = str_replace('"',"'", json_encode($tabs));
?>

<si-mediabox si-model="model" si-picture-list-as="grid" 
    si-height="<?php echo($height) ?>" 
    si-tabs="<?php echo($tabArray) ?>"></si-mediabox>
