<div class="sort-container" data-ng-show="display_mode!='map'">
    <div class="si-dropdown" data-show-button-icon="false">
        <div class="dropdown-button"><i class="far fa-sort-amount-down"></i></div>
        <div class="si-dropdown-panel">
            <div class="dropdown-item {{client_sort=='date_desc' ? 'active':''}}" data-ng-click="sortByDate(true)"><?php _e('Latest to oldest',SI) ?></div>
            <div class="dropdown-item {{client_sort=='date_asc' ? 'active':''}}" data-ng-click="sortByDate(false)"><?php _e('Oldest to latest',SI) ?></div>
            <div class="dropdown-item {{client_sort=='price_desc' ? 'active':''}}" data-ng-click="sortByPrice(true)"><?php _e('Most to least expensive',SI) ?></div>
            <div class="dropdown-item {{client_sort=='price_asc' ? 'active':''}}" data-ng-click="sortByPrice(false)"><?php _e('Least to most expensive',SI) ?></div>
        </div>
    </div>
</div>