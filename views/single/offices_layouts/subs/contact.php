<div class="si-contact">

    <div class="actions" ng-if="model.email">
        <?php echo do_shortcode('[si_office_part part="info_request" class="si-prevent-typography"]') ?>
    </div>    

    <div class="si-phone-list si-apply-typography">
        <div class="si-item si-phone-type-{{key}}" data-ng-repeat="(key,phone) in model.phones" ng-if="phone != ''">
            <a href="tel:{{phone}}"><i class="si-icon fal fa-fw fa-{{getPhoneIcon(key)}}"></i> <span class="si-prefix">{{key.siHumanize().replace('Office t','T').translate()}}:</span> <span class="si-label">{{phone}}</span></a>
        </div>
    </div>
    
</div>