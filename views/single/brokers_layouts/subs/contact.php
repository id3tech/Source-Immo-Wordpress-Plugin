<div class="contact">
    <h3>{{'To contact {0}'.translate().format(model.first_name)}}</h3>
    <div class="phone-list">
        <div class="item" data-ng-repeat="(key,phone) in model.phones">
            <i class="fal fa-fw fa-{{getPhoneIcon(key)}}"></i> {{phone}}
        </div>
    </div>
    
    <div class="actions">
    <?php echo do_shortcode('[immodb_broker_part part="info_request"]') ?>
    </div>
</div>