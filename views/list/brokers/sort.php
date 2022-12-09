<div class="si-sort-container" data-ng-show="display_mode!='map'">
    <div class="si-dropdown" data-show-button-icon="false">
        <div class="si-dropdown-button"><i class="far fa-sort-amount-down"></i></div>
        <div class="si-dropdown-panel">
            <div class="si-dropdown-item {{client_sort=='name_asc' ? 'active':''}}" data-ng-click="sortByName(false)"><?php si_label('From A to Z') ?></div>
            <div class="si-dropdown-item {{client_sort=='name_desc' ? 'active':''}}" data-ng-click="sortByName(true)"><?php si_label('From Z to A') ?></div>
            <div class="si-dropdown-item {{client_sort=='listing_count_asc' ? 'active':''}}" data-ng-click="sortByListingCount(true)"><?php si_label('Most to least listings') ?></div>
            <div class="si-dropdown-item {{client_sort=='listing_count_desc' ? 'active':''}}" data-ng-click="sortByListingCount(false)"><?php si_label('Least to most listings') ?></div>
        </div>
    </div>
</div>