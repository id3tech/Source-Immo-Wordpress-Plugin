<div class="input">
        <i class="far fa-search"></i>
        <div class="dropdown">
            <input type="text" placeholder="<?php _e('Search a name, region, city',IMMODB) ?>"
                data-ng-model="data.keyword" data-ng-keyup="buildSuggestions($event)" data-toggle="dropdown">
            <div class="dropdown-menu" ng-show="suggestions.length>0">
                <form>
                    <div class="keyword-suggestion {{item.selected?'selected':''}}" 
                            data-ng-repeat="item in suggestions" data-ng-click="item.action()"
                            data-toggle="dropdown">
                        {{item.label}}
                    </div>
                </form>
            </div>
        </div>
        <i class="geo-btn far fa-crosshairs {{data.location!=null ? 'active' : ''}}" data-ng-show="geolocation_available" data-ng-click="addGeoFilter()"></i>
    </div>

    <div class="advanced">
        

        <div class="search-trigger">
            <button type="button" class="btn" data-ng-click="navigate()"><?php _e('Search', IMMODB) ?></button>
        </div>
    </div>

    <div class="client-filters" data-ng-show="hasFilters()">
        <div class="label"><?php _e('Selected filters', IMMODB) ?></div>
        <div class="list">
            <div class="item" data-ng-repeat="item in filterHints">{{item.label}} <i class="fal fa-times" data-ng-click="item.reverse()"></i></div>
        </div>
        <div class="reset"><button type="button" class="btn" data-ng-click="resetFilters()"><?php _e('Reset', IMMODB) ?></button></div>
    </div>