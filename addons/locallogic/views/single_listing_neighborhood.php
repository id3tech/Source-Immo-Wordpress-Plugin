<?php
global $listing_data;
?>

<div class="neighborhood si-detail-section {{sectionOpened('neighborhood')?'opened':''}}">
    <div class="si-title" data-ng-click="toggleSection('neighborhood')"><div><?php _e('Neighborhood',SI) ?></div> <div class="si-icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div></div>
    <div class="si-detail-section-content">
        
        <ll-content-widget></ll-content-widget>
    </div>
</div>