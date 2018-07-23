    <div class="input">
        <i class="far fa-search"></i>
        <div class="dropdown">
            <input type="text" placeholder="<?php _e('Search a region, city, street',IMMODB) ?>"
                ng-model="data.keyword" ng-keyup="buildSuggestions($event)" data-toggle="dropdown">
            <div class="dropdown-menu">
                <label class="placeholder" ng-show="suggestions.length==0"><?php _e("Type something to begin your search",IMMODB) ?></label>
                <div class="keyword-suggestion {{item.selected?'selected':''}}" ng-repeat="item in suggestions" ng-click="item.action()">
                    {{item.label}}
                </div>
            </div>
        </div>
        <i class="far fa-crosshairs"></i>
    </div>

    <div class="advanced">
        <div class="price dropdown">
            <button type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <?php _e('Price', IMMODB) ?>
            </button>
            <div class="dropdown-menu dropdown-menu-right">
                <form>
                    <div class="min-price layout-column">
                        <input type="number" min="0" ng-model="data.min_price" >
                        <div class="dropdown-divider"></div>
                        <div ng-repeat="item in minPriceSuggestions" ng-click="setMinPrice(item.value,$event)">{{item.label}}</div>
                    </div>
                    <div class="max-price layout-column">
                        <input type="number" min="{{data.min_price}}" ng-model="data.max_price">
                        <div class="dropdown-divider"></div>
                        <div ng-repeat="item in maxPriceSuggestions" ng-click="setMaxPrice(item.value,$event)">{{item.label}}</div>
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
                    
                    <div class="category layout-column">
                        

                        <h4><?php _e('Category',IMMODB) ?></h4>
                        <div class="dropdown-divider"></div>
                        <div class="pretty p-icon p-pulse"  ng-repeat="(key,item) in dictionary.listing_category"
                            ng-click="addFilter('category','in',getSelection(dictionary.listing_category))">
                            <input type="checkbox" ng-model="item.selected"> 
                            <div class="state p-success">
                                <i class="icon fal fa-check"></i>
                                <label>{{item.caption}}</label>
                            </div>
                        </div>
                    </div>

                    <div class="subcategory layout-column">
                        <h4><?php _e('Subcategory',IMMODB) ?></h4>
                        <div class="dropdown-divider"></div>
                        <div class="pretty p-icon p-pulse"  ng-repeat="(key,item) in dictionary.listing_subcategory"
                            ng-click="addFilter('subcategory','in',getSelection(dictionary.listing_subcategory))">
                            <input type="checkbox"  ng-model="item.selected"> 
                            <div class="state p-success">
                                <i class="icon fal fa-check"></i>
                                <label>{{item.caption}}</label>
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
                    <div class="states layout-column">
                        <h4><?php _e('Caracteristics',IMMODB) ?></h4>
                        <div class="dropdown-divider"></div>
                        <div class="pretty p-icon p-pulse"  ng-repeat="(key,item) in listing_states"
                            ng-click="setState(item)">
                            <input type="checkbox" ng-model="item.selected"> 
                            <div class="state p-success">
                                <i class="icon fal fa-check"></i>
                                <label>{{item.caption}}</label>
                            </div>
                        </div>
                    </div>

                    <div class="states layout-column">
                        <h4><?php _e('Transaction',IMMODB) ?></h4>
                        <div class="dropdown-divider"></div>
                        <div class="pretty p-icon p-pulse"  ng-repeat="(key,item) in listing_states"
                            ng-click="setState(item)">
                            <input type="checkbox" ng-model="item.selected"> 
                            <div class="state p-success">
                                <i class="icon fal fa-check"></i>
                                <label>{{item.caption}}</label>
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
            <div class="item" ng-repeat="item in filterHints">{{item.label}} <i class="fal fa-times"></i></div>
        </div>
        <div class="reset"><button type="button" class="btn" ng-click="resetFilters()"><?php _e('Reset', IMMODB) ?></button></div>
    </div>