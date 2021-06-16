<div class="si-detail-section contact">
    <div class="phone-list si-apply-typography">
        <div class="item" data-ng-repeat="(key,phone) in model.phones">
            <i class="fal fa-fw fa-{{getPhoneIcon(key)}}"></i> {{phone}}
        </div>
    </div>
    
    <div class="actions">
        <?php echo do_shortcode('[si_broker_part part="info_request" class="si-prevent-typography"]') ?>
    </div>
</div>