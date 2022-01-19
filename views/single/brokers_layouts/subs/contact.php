<div class="si-detail-section contact">

    <div class="actions">
        <?php echo do_shortcode('[si_broker_part part="info_request" class="si-prevent-typography"]') ?>
    </div>    

    <div class="phone-list si-apply-typography">
        <div class="item" data-ng-repeat="(key,phone) in model.phones">
            <a href="tel:{{phone}}"><i class="fal fa-fw fa-{{getPhoneIcon(key)}}"></i> <span>{{phone}}</span></a>
        </div>
    </div>
    
</div>