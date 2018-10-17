<div class="input">
        <i class="far fa-search"></i>
        <div class="dropdown">
            <input type="text" placeholder="<?php _e('Search a name, region, city',IMMODB) ?>"
                data-ng-model="data.keyword" data-ng-keyup="buildSuggestions($event)" data-toggle="dropdown">
            <div class="dropdown-menu">
                <form>
                    <div class="region-city-list" data-ng-show="suggestions.length==0">
                        <div class="tabs tabs-left">
                            <div class="regions tab-header with-title">
                                <h4 class="title"><?php _e('Regions',IMMODB) ?></h4>
                                <div class="tab-item {{tab_region==item.__$key ? 'active' : ''}}" 
                                    data-ng-repeat="item in dictionary.region | orderObjectBy: 'caption'" 
                                    data-ng-click="changeRegionTab(item.__$key)">{{item.caption}}</div>
                            </div>

                            <div class="cities tab-content">
                                <div class="grid-layout-column">
                                    <h4><?php _e('Cities',IMMODB) ?></h4>
                                    <div class="pretty p-icon p-pulse"  data-ng-repeat="(key,item) in dictionary.city | orderObjectBy: 'caption'"
                                        data-ng-show="item.parent.trim()==tab_region"
                                        data-ng-click="addFilter('location.city_code','in',getSelection(dictionary.city))">
                                        <input type="checkbox"  data-ng-model="item.selected"> 
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