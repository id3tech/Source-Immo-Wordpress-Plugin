<?php
global $listing_data;
//__c($listings_data)
?>

<div class="demographics si-detail-section {{sectionOpened('demographics')?'opened':''}}">
    <div class="si-title" data-ng-click="toggleSection('demographics')"><div><?php _e('Demographics',SI) ?></div> <div class="si-icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div></div>
    <div class="si-detail-section-content">
        <?php echo(do_shortcode('[ll_demographics lat="' . $listing_data->location->latitude . '"  lng="' . $listing_data->location->longitude . '"]')); ?>
    </div>
</div>