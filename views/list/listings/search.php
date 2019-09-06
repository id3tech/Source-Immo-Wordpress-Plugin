    

    <div class="search-box">
        
        <si-search-box 
                alias="<?php echo $configs->alias ?>" 
                placeholder="<?php _e('Search a region, city, street',SI) ?>"></si-search-box>
        
        <i class="geo-btn far fa-crosshairs {{data.location!=null ? 'active' : ''}}" data-ng-show="geolocation_available" data-ng-click="filter.addGeoFilter()"></i>
    </div>

    <div class="advanced">
        <button class="cities {{isExpanded('cities')}} {{filter.hasFilter('location.city_code') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('cities')"><?php _e('Cities', SI) ?></button>
    
        <button class="price {{isExpanded('price')}} {{filter.hasFilter('price.sell.amount') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('price')"><?php _e('Price', SI) ?></button>
    
        <button class="category {{isExpanded('categories')}} {{filter.hasFilter(['category_code','subcategory_code']) ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('categories')"><?php _e('Home types', SI) ?></button>
        
        <button class="rooms {{isExpanded('rooms')}} {{filter.hasFilter(['main_unit.bedroom_count','main_unit.bathroom_count']) ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('rooms')"><?php _e('Rooms', SI) ?></button>
        
        <button class="more {{isExpanded('others')}} {{filter.hasFilter(['contract.start_date','attributes.*','building.category_code','status_code','*_flag','open_houses*','price.foreclosure']) ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('others')"><?php _e('More', SI) ?></button>
    
        <div class="search-trigger">
            <button type="button" class="trigger-button button" data-ng-click="showResultPage()"><?php _e('Search', SI) ?></button>
        </div>

        
    </div>


    <!-- Cities -->
    <div class="filter-panel cities-panel {{isExpanded('cities')}}">
        <button class="panel-trigger {{isExpanded('cities')}} {{filter.hasFilter('location') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('cities')"><?php _e('Cities', SI) ?></button>
        <div class="filter-panel-content">
            <div class="region-city-list">                 
                <div class="tabs tabs-left">
                    
                    <div class="regions tab-header with-title">
                        <h4 class="title"><?php _e('Regions',SI) ?></h4>
                        <div class="tab-item {{tab_region==item.__$obj_key ? 'active' : ''}} {{sublistHasFilters(item.__$obj_key, dictionary.city) ? 'has-filters' : ''}}" 
                            data-ng-repeat="item in dictionary.region | orderObjectBy: 'caption'" 
                            data-ng-click="changeRegionTab(item.__$obj_key)">{{item.caption}}</div>
                    </div>

                    <div class="cities tab-container {{region.__$obj_key==tab_region ? 'opened' : ''}}" 
                                    ng-repeat="region in dictionary.region | orderObjectBy: 'caption'">

                        <h4 class="title"><?php _e('Cities',SI) ?></h4>

                        <div class="tab-title {{sublistHasFilters(region.__$obj_key, dictionary.city) ? 'has-filters' : ''}}" ng-click="changeRegionTab(region.__$obj_key)">{{region.caption}}</div>
                        <div class="tab-content">
                            <div class="check-list grid-layout-column {{region.__$obj_key==tab_region ? 'opened' : ''}}">    
                                <si-checkbox class="all-cities"
                                    data-label="{{'All cities'.translate()}}" 
                                    data-ng-model="region.selected"
                                    data-ng-click="toggleAllFor('location.city_code','in', dictionary.city, region)"></si-checkbox>
                                
                                <si-checkbox
                                    data-ng-repeat="city in city_list | filter : {parent: tab_region} | orderObjectBy: 'caption'"
                                    data-ng-click="filter.addFilter('location.city_code','in',getSelection(dictionary.city))"
                                    data-ng-model="dictionary.city[city.__$obj_key].selected"
                                    data-label="{{city.caption.replace('(' + region.caption +')','')}}"
                                    ></si-checkbox>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <!-- Price -->
    <div class="filter-panel price-panel {{isExpanded('price')}}">
        <button class="panel-trigger {{isExpanded('price')}} {{filter.hasFilter('price') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('price')"><?php _e('Price', SI) ?></button>
        <div class="filter-panel-content">
            <div class="price-inputs">
                <si-slider model="priceRange" step="0.05" on-change="updatePrice()" start-label="Min" end-label="<?php _e('Unlimited',SI) ?>"></si-slider>
                <div class="min">
                    <em><?php _e('Minimal price', SI) ?></em>
                    <h2 class="price-value">{{getPriceFromScale(priceRange[0],10000)}}</h2>
                </div>
                
                <i class="price-divider fal fa-3x fa-arrows-h"></i>

                <div class="max">
                    <em><?php _e('Maximal price', SI) ?></em>
                    <h2 class="price-value">{{getPriceFromScale(priceRange[2],-10000,1000000,'<?php _e('Unlimited',SI) ?>')}}</h2>
                </div>

            </div>
        </div>
    </div>

    <!-- Category -->
    <div class="filter-panel categories-panel {{isExpanded('categories')}}">
        <button class="panel-trigger {{isExpanded('categories')}} {{filter.hasFilter('category') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('categories')"><?php _e('Home types', SI) ?></button>
        <div class="filter-panel-content">
            <div class="tabs tabs-left">
                <div class="category tab-header with-title"">
                    <h4 class="title"><?php _e('Categories',SI) ?></h4>
                    <div class="tab-item {{tab_category==key ? 'active' : ''}} {{item.selected || sublistHasFilters(key, dictionary.listing_subcategory) ? 'has-filters' : ''}}" 
                        data-ng-repeat="(key,item) in dictionary.listing_category"
                        data-ng-click="changeCategoryTab(key)">
                        <i class="far fa-fw fa-{{getCategoryIcon(key)}}"></i>
                        <label>{{item.caption}}</label>
                    </div>
                </div>
                <div class="subcategory tab-container {{category_key==tab_category ? 'opened' : ''}}"
                            ng-repeat="(category_key,category) in dictionary.listing_category">
                    <h4 class="title"><?php _e('Types',SI) ?></h4>
                    
                    <div class="tab-title {{tab_category==category_key ? 'active' : ''}} {{category.selected || sublistHasFilters(category_key, dictionary.listing_subcategory) ? 'has-filters' : ''}}" 
                        data-ng-click="changeCategoryTab(category_key)">
                        <i class="far fa-fw fa-{{getCategoryIcon(category_key)}}"></i>
                        <label>{{category.caption}}</label>
                    </div>

                    <div class="tab-content">
                        <div class="check-list grid-layout-column {{category_key==tab_category ? 'opened' : ''}}">
                            <si-checkbox
                                ng-show="(subcategory_list | filter: {parent: category_key}).length==0"
                                data-ng-click="filter.addFilter('category_code','in',getSelection(dictionary.listing_category))"
                                data-ng-model="category.selected"
                                data-label="{{category.caption}}"
                                ></si-checkbox>
                            <si-checkbox
                                data-ng-repeat="item in subcategory_list | filter: {parent: tab_category} | orderBy: 'caption'"
                                data-ng-click="filter.addFilter('subcategory_code','in',getSelection(dictionary.listing_subcategory))"
                                data-ng-model="dictionary.listing_subcategory[item.__$obj_key].selected"
                                data-label="{{item.caption}}"
                                ></si-checkbox>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    </div>

    <!-- Rooms -->
    <div class="filter-panel rooms-panel {{isExpanded('rooms')}}">
        <button class="panel-trigger {{isExpanded('rooms')}} {{filter.hasFilter('room') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('rooms')"><?php _e('Rooms', SI) ?></button>
        <div class="filter-panel-content">
            <div class="bedrooms">
                <h4><?php _e('Bedrooms',SI) ?></h4>
                
            

                <si-radio
                        data-ng-repeat="item in bedroomSuggestions"
                        name="bedrooms-count"
                        data-ng-click="filter.addFilter('main_unit.bedroom_count','greater_or_equal_to',item.value, item.caption)"
                        data-ng-checked="filter.getFilterValue('main_unit.bedroom_count') == item.value"
                        data-label="{{item.label}}"
                    ></si-radio>

                <si-radio
                        name="bedrooms-count"
                        data-ng-click="filter.addFilter('main_unit.bedroom_count','greater_or_equal_to','')"
                        data-ng-checked="filter.getFilterValue('main_unit.bedroom_count') == null"
                        data-label="<?php _e('Any',SI) ?>"
                    ></si-radio>
                
            </div>

            <div class="bathrooms">
                <h4><?php _e('Bathrooms',SI) ?></h4>
                
                <si-radio
                        data-ng-repeat="item in bathroomSuggestions"
                        name="bathrooms-count"
                        data-ng-click="filter.addFilter('main_unit.bathroom_count','greater_or_equal_to',item.value, item.caption)"
                        data-ng-checked="filter.getFilterValue('main_unit.bathroom_count') == item.value"
                        data-label="{{item.label}}"
                    ></si-radio>

                <si-radio
                        name="bathrooms-count"
                        data-ng-click="filter.addFilter('main_unit.bathroom_count','greater_or_equal_to','')"
                        data-ng-checked="filter.getFilterValue('main_unit.bathroom_count') == null"
                        data-label="<?php _e('Any',SI) ?>"
                    ></si-radio>

            </div>
        </div>
    </div>

    <!-- Mores -->
    <div class="filter-panel others-panel {{isExpanded('others')}}">
        <button class="panel-trigger {{isExpanded('others')}} {{filter.hasFilter('other') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('others')"><?php _e('More', SI) ?></button>
        <div class="filter-panel-content">
            <div class="age grid-layout-column">
                <h4><?php _e('Online for',SI) ?></h4>

                <div class="si-dropdown" data-has-value="{{filter.getFilterValue('contract.start_date')}}">
                    <button class="button" type="button">{{filter.getFilterCaptionFromList('contract.start_date',listing_ages,listing_ages[0].caption)}}</button>
                    <div class="si-dropdown-panel">
                        <div class="dropdown-item
                                {{filter.getFilterValue('contract.start_date') == item.filter.value ? 'active' : ''}}"
                            data-ng-click="filter.addFilter(item.filter.field,item.filter.operator,item.filter.value, 'Online for {0}'.translate().format(item.caption))"
                            data-ng-repeat="item in listing_ages">
                            {{item.caption}}
                        </div>
                    </div>
                </div>

            </div>

            <div class="parkings grid-layout-column">
                <h4><?php _e('Parkings',SI) ?></h4>
                
                <div class="si-dropdown" data-has-value="{{filter.getFilterValue('attributes.PARKING')}}">
                    <button class="button" type="button">{{filter.getFilterCaptionFromList('attributes.PARKING',parkingSuggestions, '<?php _e('Any',SI) ?>')}}</button>
                    <div class="si-dropdown-panel">
                        <div class="dropdown-item
                                {{filter.getFilterValue('attributes.PARKING') == null ? 'active' : ''}}"
                            data-ng-click="filter.addFilter('attributes.PARKING','greater_or_equal_to',item.value, '')">
                            <?php _e('Any',SI) ?>
                        </div>
                        <div class="dropdown-item
                                {{filter.getFilterValue('attributes.PARKING') == item.value ? 'active' : ''}}"
                            data-ng-click="filter.addFilter('attributes.PARKING','greater_or_equal_to',item.value, item.caption)"
                            data-ng-repeat="item in parkingSuggestions">
                            {{item.label}}
                        </div>
                    </div>
                </div>


                
            </div>

            <div class="building_category grid-layout-column">
                <h4><?php _e('Building types',SI) ?></h4>
                <div class="dropdown-divider"></div>

                <si-checkbox
                    data-ng-repeat="(key,item) in dictionary.building_category"
                    data-ng-click="filter.addFilter('building.category_code','in',filter.getSelection(dictionary.building_category))"
                    data-ng-model="item.selected"
                    data-label="{{item.caption.translate()}}"
                    ></si-checkbox>
            </div>


            <div class="attribute grid-layout-column">
                <h4><?php _e('Caracteristics',SI) ?></h4>
                <div class="dropdown-divider"></div>
                
                <si-checkbox
                    data-ng-repeat="(key,item) in listing_attributes"
                    data-ng-click="filter.addAttributeFilter(item)"
                    data-ng-model="item.selected"
                    data-label="{{item.caption.translate()}}"
                    ></si-checkbox>

               
            </div>

            <div class="transaction grid-layout-column">
                <h4><?php _e('Filters',SI) ?></h4>
                <div class="dropdown-divider"></div>
                <si-checkbox
                    data-ng-repeat="(key,item) in listing_states"
                    data-ng-click="setState(item)"
                    data-ng-model="item.selected"
                    data-label="{{item.caption.translate()}}"
                    ></si-checkbox>
                 
            </div>
        </div>
    </div>
        

    <div class="client-filters" ng-show="filter.hasFilters()">
        <div class="label"><?php _e('Selected filters', SI) ?></div>
        <div class="list">
            <div class="item" data-ng-repeat="item in filterHints">{{item.label}} <i class="fas fa-times" data-ng-click="item.reverse()"></i></div>
        </div>
        <div class="reset"><button type="button" class="button" data-ng-click="resetFilters()"><?php _e('Reset', SI) ?></button></div>
    </div>