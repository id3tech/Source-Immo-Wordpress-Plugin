<div class="contact">
    <div class="phone-list si-apply-typography">
        <div class="item" data-ng-repeat="(key,phone) in model.main_office.phones">
            <i class="fal fa-fw fa-{{getPhoneIcon(key)}}"></i> <span>{{phone}}</span>
        </div>
    </div>
</div>