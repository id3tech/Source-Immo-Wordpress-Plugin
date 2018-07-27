    <div class="input">
        <i class="far fa-search"></i>
        <div class="dropdown">
            <input type="text" placeholder="<?php _e('Search a region, city, street',IMMODB) ?>"
                ng-model="data.keyword" ng-keyup="buildSuggestions($event)" data-toggle="dropdown">
            <div class="dropdown-menu">
                <form>
                    <div class="region-city-list" ng-show="suggestions.length==0">
                        <div class="tabs tabs-left">
                            <div class="regions tab-header">
                                <div class="tab-item {{tab_region==item.__$key ? 'active' : ''}}" 
                                    ng-repeat="item in dictionary.region | orderObjectBy: 'caption'" 
                                    ng-click="changeRegionTab(item.__$key)">{{item.caption}}</div>
                            </div>

                            <div class="cities tab-content">
                                <div class="layout-column">
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
        <div class="price dropdown">
            <button type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <?php _e('Price', IMMODB) ?>
            </button>
            <div class="dropdown-menu dropdown-menu-right">
                <form>
                    <div class="price-inputs">
                        <div class="min">
                            <input type="number" min="0" ng-model="data.min_price" ng-click="selectPriceInput('min')" >
                        </div>
                        
                        <i class="fal fa-2x fa-arrows-h"></i>

                        <div class="max">
                            <input type="number" min="{{data.min_price}}" ng-model="data.max_price" ng-click="selectPriceInput('max')">
                        </div>

                    </div>
                    <div class="price-suggestions layout-column target-{{selected_price_input}}">
                        <div ng-repeat="item in priceSuggestions" class="item" ng-click="setPrice(item.value,$event)">{{item.label}}</div>
                    </div>
                </form>
            </div>
        </div>

        <div class="category dropdown">
            <button type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <?php _e('Home types', IMMODB) ?>
            </button>
            <div class="dropdown-menu dropdown-menu-right">
                <form>
                    <div class="tabs tabs-top">
                        <div class="category tab-header">
                            <div class="tab-item {{tab_category==key ? 'active' : ''}}" ng-repeat="(key,item) in dictionary.listing_category"
                                ng-click="changeCategoryTab(key)">
                                <i class="far fa-2x fa-fw fa-{{getCategoryIcon(key)}}"></i>
                                <label>{{item.abbr}}</label>
                            </div>
                        </div>
                        <div class="subcategory tab-content layout-column">
                            <div class="pretty p-icon p-pulse"  ng-repeat="item in dictionary.listing_subcategory | orderObjectBy: 'caption'"
                                ng-show="item.parent==tab_category"
                                ng-click="addFilter('subcategory','in',getSelection(dictionary.listing_subcategory))">
                                <input type="checkbox"  ng-model="item.selected"> 
                                <div class="state p-success">
                                    <i class="icon fal fa-check"></i>
                                    <label>{{item.caption}}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div class="bedrooms dropdown">
            <button type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <?php _e('Bedrooms', IMMODB) ?>
            </button>
            <div class="dropdown-menu dropdown-menu-right">
                
                <div class="menu-item {{item.selected?'selected':''}}" ng-repeat="item in bedroomSuggestions"
                     ng-click="setBedroomCount(item)">{{item.label}}</div>
                <div class="dropdown-divider"></div>
                <div class="menu-item" ng-click="setBedroomCount({value:''})"><?php _e('Any',IMMODB) ?></div>
                
            </div>
        </div>

        <div class="more dropdown ">
            <button type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <?php _e('More', IMMODB) ?>
            </button>
            <div class="dropdown-menu dropdown-menu-right">
                <form>
                    <div class="bathrooms layout-column">
                        <h4><?php _e('Bathrooms',IMMODB) ?></h4>
                        <div class="dropdown-divider"></div>

                        <div class="pretty p-icon p-pulse p-round"
                            ng-click="addFilter('main_unit.bedroom_count','greater_or_equal_to','')">
                            <input type="radio" name="bathrooms-count" ng-checked="getFilterValue('main_unit.bedroom_count') == null"> 
                            <div class="state">
                                <i class="icon fal fa-check"></i>
                                <label><?php _e('Any',IMMODB) ?></label>
                            </div>
                        </div>

                        <div class="pretty p-icon p-pulse p-round"  ng-repeat="item in bathroomSuggestions"
                            ng-click="addFilter('main_unit.bedroom_count','greater_or_equal_to',item.value, item.caption)">
                            <input type="radio" name="bathrooms-count" ng-checked="getFilterValue('main_unit.bedroom_count') == item.value"> 
                            <div class="state">
                                <i class="icon fal fa-check"></i>
                                <label>{{item.label}}</label>
                            </div>
                        </div>
                        
                    </div>

                    <div class="age layout-column">
                        <h4><?php _e('Online for',IMMODB) ?></h4>
                        <div class="dropdown-divider"></div>

                        <div class="pretty p-icon p-pulse p-round"  ng-repeat="item in listing_ages"
                            ng-click="addFilter(item.filter.field,item.filter.operator,item.filter.value, 'Online for {0}'.translate().format(item.caption))">
                            <input type="radio" name="listing-age" ng-checked="getFilterValue('contract.start_date') == item.filter.value"> 
                            <div class="state">
                                <i class="icon fal fa-check"></i>
                                <label>{{item.caption}}</label>
                            </div>
                        </div>
                        
                    </div>

                    <div class="parkings layout-column">
                        <h4><?php _e('Parkings',IMMODB) ?></h4>
                        <div class="dropdown-divider"></div>

                        <div class="pretty p-icon p-pulse p-round"
                            ng-click="addFilter('attributes.PARKING','greater_or_equal_to','')">
                            <input type="radio" name="parking-count" ng-checked="getFilterValue('attributes.PARKING') == null"> 
                            <div class="state">
                                <i class="icon fal fa-check"></i>
                                <label><?php _e('Any',IMMODB) ?></label>
                            </div>
                        </div>

                        <div class="pretty p-icon p-pulse p-round"  ng-repeat="item in parkingSuggestions"
                            ng-click="addFilter('attributes.PARKING','greater_or_equal_to',item.value, item.caption)">
                            <input type="radio" name="parking-count" ng-checked="getFilterValue('attributes.PARKING') == item.value"> 
                            <div class="state">
                                <i class="icon fal fa-check"></i>
                                <label>{{item.label}}</label>
                            </div>
                        </div>
                        
                    </div>

                    <div class="building_category layout-column">
                        <h4><?php _e('Building type',IMMODB) ?></h4>
                        <div class="dropdown-divider"></div>
                        <div class="pretty p-icon p-pulse"  ng-repeat="(key,item) in dictionary.building_category"
                            ng-click="addFilter('building.category','in',getSelection(dictionary.building_category))">
                            <input type="checkbox" ng-model="item.selected"> 
                            <div class="state p-success">
                                <i class="icon fal fa-check"></i>
                                <label>{{item.caption}}</label>
                            </div>
                        </div>
                    </div>


                    <div class="attribute layout-column">
                        <h4><?php _e('Caracteristics',IMMODB) ?></h4>
                        <div class="dropdown-divider"></div>
                        <div class="pretty p-icon p-pulse"  ng-repeat="(key,item) in listing_attributes"
                            ng-click="addAttributeFilter(item)">
                            <input type="checkbox" ng-model="item.selected"> 
                            <div class="state p-success">
                                <i class="icon fal fa-check"></i>
                                <label>{{item.caption.translate()}}</label>
                            </div>
                        </div>
                    </div>

                    <div class="transaction layout-column">
                        <h4><?php _e('Filters',IMMODB) ?></h4>
                        <div class="dropdown-divider"></div>
                        <div class="pretty p-icon p-pulse"  ng-repeat="(key,item) in listing_states"
                            ng-click="setState(item)">
                            <input type="checkbox" ng-model="item.selected"> 
                            <div class="state p-success">
                                <i class="icon fal fa-check"></i>
                                <label>{{item.caption.translate()}}</label>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </div>

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