<div class="contact si-apply-typography">
    <div class="phone-list">
        <div class="item" data-ng-repeat="(key,phone) in model.phones">
            <i class="fal fa-fw fa-{{getPhoneIcon(key)}}"></i> {{phone}}
        </div>
    </div>

    
    <div class="actions" ng-if="model.email">
        <?php echo do_shortcode('[si_office_part part="info_request" class="si-prevent-typography"]') ?>
    </div>
</div>