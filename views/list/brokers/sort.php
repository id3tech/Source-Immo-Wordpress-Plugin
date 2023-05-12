<div class="si-sort-container" data-ng-show="display_mode!='map'">
    <div class="si-dropdown" ng-if="client_sort!=null">
        <div class="si-dropdown-button"><i class="far fa-sort-amount-{{client_sort.includes('asc') ? 'up' : 'down'}}"></i> <span>{{client_sort | sortLabel}}</span></div>
        <div class="si-dropdown-panel">
            <div class="si-dropdown-item {{client_sort=='name_asc' ? 'active':''}}" data-ng-click="sortByName(false)"><?php si_label('From A to Z') ?></div>
            <div class="si-dropdown-item {{client_sort=='name_desc' ? 'active':''}}" data-ng-click="sortByName(true)"><?php si_label('From Z to A') ?></div>
            <div class="si-dropdown-item {{client_sort=='listings_desc' ? 'active':''}}" data-ng-click="sortByListingCount(true)"><?php si_label('Most listings') ?></div>
            <div class="si-dropdown-item {{client_sort=='listings_asc' ? 'active':''}}" data-ng-click="sortByListingCount(false)"><?php si_label('Least listings') ?></div>
        </div>
    </div>
</div>