<div class="information_request">
    <button type="button" class="button si-modal-trigger"
            ng-disabled="request_sent === true"
            data-target="information_request">
         
        <span ng-show="request_sent == undefined"><i class="fal fa-info"></i> <?php _e('Information request',SI) ?></span>
        <span ng-show="request_sent === true"><?php _e('Thank you',SI) ?></span>
    </button>
</div>