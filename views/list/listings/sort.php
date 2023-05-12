<div class="si-sort-container" data-ng-show="display_mode.includes('list')">
    <div class="si-dropdown" ng-if="client_sort!=null">
        <div class="si-dropdown-button"><i class="far fa-sort-amount-{{client_sort.includes('asc') ? 'up' : 'down'}}"></i> <span>{{client_sort | sortLabel}}</span></div>
        <div class="si-dropdown-panel">
            <div class="si-dropdown-item {{client_sort=='date_desc' ? 'active':''}}" data-ng-click="sortByDate(true)"><?php si_label('Latest') ?></div>
            <div class="si-dropdown-item {{client_sort=='date_asc' ? 'active':''}}" data-ng-click="sortByDate(false)"><?php si_label('Oldest') ?></div>
            <div class="si-dropdown-item {{client_sort=='price_desc' ? 'active':''}}" data-ng-click="sortByPrice(true)"><?php si_label('Highest price') ?></div>
            <div class="si-dropdown-item {{client_sort=='price_asc' ? 'active':''}}" data-ng-click="sortByPrice(false)"><?php si_label('Lowest price') ?></div>
        </div>
    </div>
</div>