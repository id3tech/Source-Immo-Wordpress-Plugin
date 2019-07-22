<?php

$layout = SourceImmo::current()->get_detail_layout('listing');
$communication_mode = isset($layout->communication_mode) ? $layout->communication_mode : 'basic';

?>

<si-modal 
    data-modal-id="information_request" 
    data-modal-title="Information request"
    <?php
    if($communication_mode != 'basic'){
        echo "data-show-controls='false'";
    }
    ?>
    data-ok-label="Send"
    data-on-ok="sendMessage()"
    data-on-validate="validateMessage($model)">
    
    <?php echo do_shortcode('[si_listing_part part="info_request"]') ?>
    
</si-modal>