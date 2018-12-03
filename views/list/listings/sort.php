<div class="sort-container" data-ng-show="display_mode!='map'">
    <div class="immodb-dropdown" data-show-button-icon="false">
        <button class="button" type="button"><i class="far fa-sort-amount-down"></i></button>
        <div class="immodb-dropdown-panel">
            <div class="dropdown-item {{client_sort=='date_desc' ? 'active':''}}" data-ng-click="sortByDate(true)"><?php _e('Latest to oldest',IMMODB) ?></div>
            <div class="dropdown-item {{client_sort=='date_asc' ? 'active':''}}" data-ng-click="sortByDate(false)"><?php _e('Oldest to latest',IMMODB) ?></div>
            <div class="dropdown-item {{client_sort=='price_desc' ? 'active':''}}" data-ng-click="sortByPrice(true)"><?php _e('Most to least expensive',IMMODB) ?></div>
            <div class="dropdown-item {{client_sort=='price_asc' ? 'active':''}}" data-ng-click="sortByPrice(false)"><?php _e('Least to most expensive',IMMODB) ?></div>
        </div>
    </div>
</div>