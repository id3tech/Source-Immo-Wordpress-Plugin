<button type="button" 
    class="si-button si-modal-trigger" ng-disabled="request_sent === true"
    data-target="information_request"> 
    <span ng-show="request_sent == undefined"><i class="fal fa-envelope"></i> <span><?php _e('Send a message',SI) ?></span></span>
    <span ng-show="request_sent === true"><?php _e('Thank you',SI) ?></span>
</button>