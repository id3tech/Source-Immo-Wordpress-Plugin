<div class="input">
    <div class="by-keywords">
        <i class="far fa-search"></i>
    
        <input type="text" placeholder="<?php _e('Search by first or last name',IMMODB) ?>"
            data-ng-model="filter.data.keyword" data-ng-keyup="lateCall(searchForKeyword)">
    </div>
    <div class="by-letters">
        <i class="far fa-bookmark"></i>

        <div class="letter-list">
            <div class="letter {{filter.getFilterValue('last_name') == letter ? 'active' : ''}}" 
                    ng-repeat="letter in alphaList" 
                    ng-click="filter.addFilter('last_name','starts_with',letter)">
                {{letter.toUpperCase()}}
            </div>
        </div>
    </div>

    <button class="button clear-button" ng-show="filter.hasFilters()" ng-click="filter.resetFilters()">
        <i class="far fa-times"></i>
    </button>
</div>

<div class="advanced">
    <div class="search-trigger">
        <button type="button" class="btn" data-ng-click="buildAndGo()"><?php _e('Search', IMMODB) ?></button>
    </div>
</div>