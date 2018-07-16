<div class="sort-container">
    <div class="dropdown">
        <button class="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fal fa-sort-amount-down"></i></button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <div class="dropdown-item" ng-click="sortByDate(true)"><?php _e('Latest to oldest',IMMODB) ?></div>
            <div class="dropdown-item" ng-click="sortByDate(false)"><?php _e('Oldest to latest',IMMODB) ?></div>
            <div class="dropdown-item" ng-click="sortByPrice(true)"><?php _e('Most to least expensive',IMMODB) ?></div>
            <div class="dropdown-item" ng-click="sortByPrice(false)"><?php _e('Least to most expensive',IMMODB) ?></div>
        </div>
    </div>
</div>