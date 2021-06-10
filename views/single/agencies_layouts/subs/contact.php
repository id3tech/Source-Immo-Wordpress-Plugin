<div class="contact">
    <div class="phone-list">
        <div class="item" data-ng-repeat="(key,phone) in model.main_office.phones">
            <i class="fal fa-fw fa-{{getPhoneIcon(key)}}"></i> {{phone}}
        </div>
    </div>
</div>