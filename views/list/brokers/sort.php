<div class="sort-container" data-ng-show="display_mode!='map'">
    <div class="si-dropdown" data-show-button-icon="false">
        <div class="dropdown-button"><i class="far fa-sort-amount-down"></i></div>
        <div class="si-dropdown-panel">
            <div class="dropdown-item {{client_sort=='name_asc' ? 'active':''}}" data-ng-click="sortByName(false)"><?php echo(apply_filters('si_label', __('From A to Z',SI))) ?></div>
            <div class="dropdown-item {{client_sort=='name_desc' ? 'active':''}}" data-ng-click="sortByName(true)"><?php echo(apply_filters('si_label', __('From Z to A',SI))) ?></div>
            <div class="dropdown-item {{client_sort=='listing_count_asc' ? 'active':''}}" data-ng-click="sortByListingCount(true)"><?php echo(apply_filters('si_label', __('Most to least listings',SI))) ?></div>
            <div class="dropdown-item {{client_sort=='listing_count_desc' ? 'active':''}}" data-ng-click="sortByListingCount(false)"><?php echo(apply_filters('si_label', __('Least to most listings',SI))) ?></div>
        </div>
    </div>
</div>