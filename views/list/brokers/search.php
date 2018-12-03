<div class="input">
    <div class="by-keywords">
        <i class="far fa-search"></i>
    
        <input type="text" placeholder="<?php _e('Search a first name or last name',IMMODB) ?>"
            data-ng-model="data.keyword" data-ng-keyup="lateCall(searchForKeyword)">
    </div>
    <div class="by-letters">
        <i class="far fa-bookmark"></i>

        <div class="letter-list">
            <div class="letter {{getFilterValue('first_name') == letter ? 'active' : ''}}" ng-repeat="letter in alphaList" ng-click="addFilter('first_name','starts_with',letter)">
                {{letter.toUpperCase()}}
            </div>
        </div>
    </div>

    <button class="button clear-button" ng-show="hasFilters()" ng-click="resetFilters()">
        <i class="far fa-times"></i>
    </button>
</div>

<div class="advanced">
    <div class="search-trigger">
        <button type="button" class="btn" data-ng-click="navigate()"><?php _e('Search', IMMODB) ?></button>
    </div>
</div>