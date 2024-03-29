<div class="tools">
    <button type="button" class="si-button si-modal-trigger" data-target="share-page"><i class="fal fa-share-alt"></i></button>
    <button type="button" class="si-button" ng-click="print()"><i class="fal fa-print"></i></button>
    <button type="button" class="si-button {{favorites.isFavorite(model.ref_number) ? 'active' : ''}}" 
        ng-if="allowFavorites()"
        ng-click="favorites.toggle(model)"><i class="{{favorites.isFavorite(model.ref_number) ? 'fas' : 'fal'}} fa-heart"></i></button>
</div>

<?php echo do_shortcode('[si_listing_part part="share_modal"]'); ?>