<div class="sort-container" data-ng-show="display_mode!='map'">
    <div class="si-dropdown" data-show-button-icon="false">
        <div class="dropdown-button"><i class="far fa-sort-amount-down"></i></div>
        <div class="si-dropdown-panel">
            <div class="dropdown-item {{client_sort=='date_desc' ? 'active':''}}" data-ng-click="sortByDate(true)"><?php echo(apply_filters('si_label', __('Latest to oldest',SI))) ?></div>
            <div class="dropdown-item {{client_sort=='date_asc' ? 'active':''}}" data-ng-click="sortByDate(false)"><?php echo(apply_filters('si_label', __('Oldest to latest',SI))) ?></div>
            <div class="dropdown-item {{client_sort=='price_desc' ? 'active':''}}" data-ng-click="sortByPrice(true)"><?php echo(apply_filters('si_label', __('Most to least expensive',SI))) ?></div>
            <div class="dropdown-item {{client_sort=='price_asc' ? 'active':''}}" data-ng-click="sortByPrice(false)"><?php echo(apply_filters('si_label', __('Least to most expensive',SI))) ?></div>
        </div>
    </div>
</div>