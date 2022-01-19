<div class="contact">
    
    <div class="actions" ng-if="model.main_office.email">
        <?php echo do_shortcode('[si_office_part part="info_request" class="si-prevent-typography"]') ?>
    </div>

    <div class="phone-list si-apply-typography">
        <div class="item" data-ng-repeat="(key,phone) in model.main_office.phones">
            <a href="tel:{{phone}}"><i class="fal fa-fw fa-{{getPhoneIcon(key)}}"></i> <span>{{phone}}</span></a>
        </div>
    </div>

</div>