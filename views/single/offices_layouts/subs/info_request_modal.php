<?php

$layout = SourceImmo::current()->get_detail_layout('office');
$communication_mode = isset($layout->communication_mode) ? $layout->communication_mode : 'basic';

?>

<si-modal 
    data-modal-id="information_request" 
    data-modal-title="{{'Message for {0}'.translate().format(model.name)}}"
    data-ok-label="Send"
    <?php
    if($communication_mode != 'basic'){
        echo "data-show-controls='false'";
    }
    ?>
    data-on-ok="sendMessage()"
    data-on-validate="validateMessage($model)">
    
    <?php echo do_shortcode('[si_office_part part="info_request_form"]') ?>
    
</si-modal>