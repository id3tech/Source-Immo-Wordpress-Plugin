<div class="tools">
    <button type="button" class="button si-modal-trigger" data-target="share-page"><i class="fal fa-share-alt"></i></button>
    <button type="button" class="button" ng-click="print()"><i class="fal fa-print"></i></button>
    <button type="button" class="button {{favorites.isFavorite(model.ref_number) ? 'active' : ''}}" ng-click="favorites.toggle(model)"><i class="{{favorites.isFavorite(model.ref_number) ? 'fas' : 'fal'}} fa-heart"></i></button>
</div>