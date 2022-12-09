<div class="si-sort-container" data-ng-show="display_mode!='map'">
    <div class="si-dropdown" data-show-button-icon="false">
        <div class="si-dropdown-button"><i class="far fa-sort-amount-down"></i></div>
        <div class="si-dropdown-panel">
            <div class="si-dropdown-item {{client_sort=='date_desc' ? 'active':''}}" data-ng-click="sortByDate(true)"><?php si_label('Latest to oldest') ?></div>
            <div class="si-dropdown-item {{client_sort=='date_asc' ? 'active':''}}" data-ng-click="sortByDate(false)"><?php si_label('Oldest to latest') ?></div>
            <div class="si-dropdown-item {{client_sort=='price_desc' ? 'active':''}}" data-ng-click="sortByPrice(true)"><?php si_label('Most to least expensive') ?></div>
            <div class="si-dropdown-item {{client_sort=='price_asc' ? 'active':''}}" data-ng-click="sortByPrice(false)"><?php si_label('Least to most expensive') ?></div>
        </div>
    </div>
</div>