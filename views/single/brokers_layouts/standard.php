
<div class="left-column">
    <?php echo do_shortcode('[immodb_broker_part part="head_info"]') ?>
    
    <?php
    echo do_shortcode('[immodb_broker_listings]')
    ?>
</div>

<div class="right-column">
    <div class="picture">
        <img src="{{model.photo.url}}" />
    </div>

    <?php echo do_shortcode('[immodb_broker_part part="contact"]') ?>

    <?php echo do_shortcode('[immodb_broker_part part="office"]') ?>

    <?php echo do_shortcode('[immodb_broker_part part="cities"]') ?>

</div>

<immodb-modal 
    data-modal-id="information_request" 
    data-modal-title="Message au courtier"
    data-ok-label="Send"
    data-on-ok="sendMessage()"
    data-on-validate="validateMessage($model)">
    
    <?php echo do_shortcode('[immodb_broker_part part="info_request"]') ?>
    
</immodb-modal>
