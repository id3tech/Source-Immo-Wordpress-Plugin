<div class="sort-container" ng-show="display_mode!='map'">
    <div class="dropdown">
        <button class="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fal fa-sort-amount-down"></i></button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <div class="dropdown-item" ng-click="sortByName(false)"><?php _e('From A to Z',IMMODB) ?></div>
            <div class="dropdown-item" ng-click="sortByName(true)"><?php _e('From Z to A',IMMODB) ?></div>
            <div class="dropdown-item" ng-click="sortByListingCount(true)"><?php _e('Most to least listings',IMMODB) ?></div>
            <div class="dropdown-item" ng-click="sortByListingCount(false)"><?php _e('Least to most listings',IMMODB) ?></div>
        </div>
    </div>
</div>