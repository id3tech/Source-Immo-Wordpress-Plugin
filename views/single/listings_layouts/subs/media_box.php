<?php
$tabArray = str_replace('"',"'", json_encode($tabs));
$pictureFit = apply_filters('si/mediabox/pictureFit','cover');
?>

<si-mediabox si-model="model" si-picture-list-as="grid" 
    si-height="<?php echo($height) ?>"
    si-picture-fit="<?php echo($pictureFit) ?>"
    si-tabs="<?php echo($tabArray) ?>"></si-mediabox>
