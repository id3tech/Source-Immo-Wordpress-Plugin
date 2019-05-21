<si-modal 
    data-modal-id="information_request" 
    data-modal-title="Information request"
    data-ok-label="Send"
    data-on-ok="sendMessage()"
    data-on-validate="validateMessage($model)">
    
    <?php echo do_shortcode('[si_listing_part part="info_request"]') ?>
    
</si-modal>