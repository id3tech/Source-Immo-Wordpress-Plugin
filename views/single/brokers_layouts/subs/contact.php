<div class="contact">
    <h3>{{'To contact {0}'.translate().format(model.first_name)}}</h3>
    <div class="phone-list">
        <div class="item" data-ng-repeat="(key,phone) in model.phones">
            <i class="fal fa-fw fa-{{getPhoneIcon(key)}}"></i> {{phone}}
        </div>
    </div>
    
    <div class="actions">
        <button type="button" 
                class="button immodb-modal-trigger" 
                data-target="information_request"><i class="fal fa-envelope"></i> <?php _e('Send a message',IMMODB) ?></button>
    </div>
</div>