<div class="input">
        <i class="far fa-search"></i>
        <div class="dropdown">
            <input type="text" placeholder="<?php _e('Search a name, region, city',IMMODB) ?>"
                ng-model="data.keyword" ng-keyup="buildSuggestions($event)" data-toggle="dropdown">
            <div class="dropdown-menu">
                <form>
                    <div class="region-city-list" ng-show="suggestions.length==0">
                        <div class="tabs tabs-left">
                            <div class="regions tab-header with-title">
                                <h4 class="title"><?php _e('Regions',IMMODB) ?></h4>
                                <div class="tab-item {{tab_region==item.__$key ? 'active' : ''}}" 
                                    ng-repeat="item in dictionary.region | orderObjectBy: 'caption'" 
                                    ng-click="changeRegionTab(item.__$key)">{{item.caption}}</div>
                            </div>

                            <div class="cities tab-content">
                                <div class="layout-column">
                                    <h4><?php _e('Cities',IMMODB) ?></h4>
                                    <div class="pretty p-icon p-pulse"  ng-repeat="(key,item) in dictionary.city | orderObjectBy: 'caption'"
                                        ng-show="item.parent.trim()==tab_region"
                                        ng-click="addFilter('location.city_code','in',getSelection(dictionary.city))">
                                        <input type="checkbox"  ng-model="item.selected"> 
                                        <div class="state p-success">
                                            <i class="icon fal fa-check"></i>
                                            <label>{{item.caption}}</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="keyword-suggestion {{item.selected?'selected':''}}" 
                            ng-repeat="item in suggestions" ng-click="item.action()"
                            data-toggle="dropdown">
                        {{item.label}}
                    </div>
                </form>
            </div>
        </div>
        <i class="geo-btn far fa-crosshairs {{data.location!=null ? 'active' : ''}}" ng-show="geolocation_available" ng-click="addGeoFilter()"></i>
    </div>

    <div class="advanced">
        

        <div class="search-trigger">
            <button type="button" class="btn" ng-click="navigate()"><?php _e('Search', IMMODB) ?></button>
        </div>
    </div>

    <div class="client-filters" ng-show="hasFilters()">
        <div class="label"><?php _e('Selected filters', IMMODB) ?></div>
        <div class="list">
            <div class="item" ng-repeat="item in filterHints">{{item.label}} <i class="fal fa-times" ng-click="item.reverse()"></i></div>
        </div>
        <div class="reset"><button type="button" class="btn" ng-click="resetFilters()"><?php _e('Reset', IMMODB) ?></button></div>
    </div>