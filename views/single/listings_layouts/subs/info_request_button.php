<?php
$layout = SourceImmo::current()->get_detail_layout('listing');
$communication_mode = isset($layout->communication_mode) ? $layout->communication_mode : 'basic';
?>

<div class="information_request">
    <?php
    if($communication_mode=='external'){
        $target = '_blank';
        if(strpos($layout->form_url, $_SERVER['HTTP_HOST'])!==false) $target = '_self';

        ?>
        <a type="button" class="si-button si-modal-trigger"
                ng-disabled="request_sent === true || context.sending_message===true"
                target="<?php echo $target ?>"
                href="<?php echo $layout->form_url ?>">
             
            <span ng-show="request_sent == undefined"><i class="fal {{context.sending_message===true ? 'fa-spin fa-spinner-third' : 'fa-info'}}"></i> <span><?php si_label('Information request') ?></span></span>
            <span ng-show="request_sent === true"><?php si_label('Thank you') ?></span>
        </a>
        <?php
    }
    else{
    ?>
    <button type="button" class="si-button si-modal-trigger"
            ng-disabled="request_sent === true || context.sending_message===true"
            data-target="information_request">
         
        <span ng-show="request_sent == undefined"><i class="fal {{context.sending_message===true ? 'fa-spin fa-spinner-third' : 'fa-info'}}"></i> <span><?php si_label('Information request') ?></span></span>
        <span ng-show="request_sent === true"><?php si_label('Thank you') ?></span>
    </button>
    <?php
    }
    ?>
</div>

<?php 
if($communication_mode!='external'){
    echo do_shortcode('[si_listing_part part="info_request_modal"]'); 
}