<div class="contact si-apply-typography">
    <div class="phone-list">
        <div class="item" data-ng-repeat="(key,phone) in model.phones">
            <i class="fal fa-fw fa-{{getPhoneIcon(key)}}"></i> {{phone}}
        </div>
    </div>
</div>