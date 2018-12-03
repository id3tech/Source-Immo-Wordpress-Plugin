<div class="sort-container" data-ng-show="display_mode!='map'">
    <div class="immodb-dropdown" data-show-button-icon="false">
        <button class="button" type="button"><i class="far fa-sort-amount-down"></i></button>
        <div class="immodb-dropdown-panel">
            <div class="dropdown-item {{client_sort=='name_asc' ? 'active':''}}" data-ng-click="sortByName(false)"><?php _e('From A to Z',IMMODB) ?></div>
            <div class="dropdown-item {{client_sort=='name_desc' ? 'active':''}}" data-ng-click="sortByName(true)"><?php _e('From Z to A',IMMODB) ?></div>
            <div class="dropdown-item {{client_sort=='listing_count_asc' ? 'active':''}}" data-ng-click="sortByListingCount(true)"><?php _e('Most to least listings',IMMODB) ?></div>
            <div class="dropdown-item {{client_sort=='listing_count_desc' ? 'active':''}}" data-ng-click="sortByListingCount(false)"><?php _e('Least to most listings',IMMODB) ?></div>
        </div>
    </div>
</div>