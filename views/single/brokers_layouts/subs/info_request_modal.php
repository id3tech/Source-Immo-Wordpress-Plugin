<si-modal 
    data-modal-id="information_request" 
    data-modal-title="{{'Message for {0}'.translate().format(model.first_name)}}"
    data-ok-label="Send"
    data-on-ok="sendMessage()"
    data-on-validate="validateMessage($model)">
    
    <?php echo do_shortcode('[si_broker_part part="info_request_form"]') ?>
    
</si-modal>