<div class="information_request">
    <button type="button" class="si-button si-modal-trigger"
            ng-disabled="request_sent === true || context.sending_message===true"
            data-target="information_request">
         
        <span ng-show="request_sent == undefined"><i class="fal {{context.sending_message===true ? 'fa-spin fa-spinner-third' : 'fa-info'}}"></i> <span><?php si_label('Information request') ?></span></span>
        <span ng-show="request_sent === true"><?php si_label('Thank you') ?></span>
    </button>
</div>

<?php echo do_shortcode('[si_listing_part part="info_request_modal"]'); ?>