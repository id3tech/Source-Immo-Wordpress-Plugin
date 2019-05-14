    

    <div class="search-box">
        
        <immodb-search-box 
                alias="<?php echo $configs->alias ?>" 
                placeholder="<?php _e('Search a region, city, street',IMMODB) ?>"></immodb-search-box>
        
        <i class="geo-btn far fa-crosshairs {{data.location!=null ? 'active' : ''}}" data-ng-show="geolocation_available" data-ng-click="filter.addGeoFilter()"></i>
    </div>

    <div class="advanced">
        <button class="cities {{isExpanded('cities')}} {{filterPanelHasFilters('location') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('cities')"><?php _e('Cities', IMMODB) ?></button>
    
        <button class="price {{isExpanded('price')}} {{filterPanelHasFilters('price') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('price')"><?php _e('Price', IMMODB) ?></button>
    
        <button class="category {{isExpanded('categories')}} {{filterPanelHasFilters('category') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('categories')"><?php _e('Home types', IMMODB) ?></button>
        
        <button class="rooms {{isExpanded('rooms')}} {{filterPanelHasFilters('room') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('rooms')"><?php _e('Rooms', IMMODB) ?></button>
        
        <button class="more {{isExpanded('others')}} {{filterPanelHasFilters('other') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('others')"><?php _e('More', IMMODB) ?></button>
    
        <div class="search-trigger">
            <button type="button" class="trigger-button button" data-ng-click="showResultPage()"><?php _e('Search', IMMODB) ?></button>
        </div>

        
    </div>


    <!-- Cities -->
    <div class="filter-panel cities-panel {{isExpanded('cities')}}">
        <button class="panel-trigger {{isExpanded('cities')}} {{filterPanelHasFilters('location') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('cities')"><?php _e('Cities', IMMODB) ?></button>
        <div class="filter-panel-content">
            <div class="region-city-list">                 
                <div class="tabs tabs-left">
                    
                    <div class="regions tab-header with-title">
                        <h4 class="title"><?php _e('Regions',IMMODB) ?></h4>
                        <div class="tab-item {{tab_region==item.__$obj_key ? 'active' : ''}} {{sublistHasFilters(item.__$obj_key, dictionary.city) ? 'has-filters' : ''}}" 
                            data-ng-repeat="item in dictionary.region | orderObjectBy: 'caption'" 
                            data-ng-click="changeRegionTab(item.__$obj_key)">{{item.caption}}</div>
                    </div>

                    <div class="cities tab-container {{region.__$obj_key==tab_region ? 'opened' : ''}}" 
                                    ng-repeat="region in dictionary.region | orderObjectBy: 'caption'">

                        <h4 class="title"><?php _e('Cities',IMMODB) ?></h4>

                        <div class="tab-title {{sublistHasFilters(region.__$obj_key, dictionary.city) ? 'has-filters' : ''}}" ng-click="changeRegionTab(region.__$obj_key)">{{region.caption}}</div>
                        <div class="tab-content">
                            <div class="check-list grid-layout-column {{region.__$obj_key==tab_region ? 'opened' : ''}}">    
                                <immodb-checkbox class="all-cities"
                                    data-label="{{'All cities'.translate()}}" 
                                    data-ng-model="region.selected"
                                    data-ng-click="toggleAllFor('location.city_code','in', dictionary.city, region)"></immodb-checkbox>
                                
                                <immodb-checkbox
                                    data-ng-repeat="city in city_list | filter : {parent: tab_region} | orderObjectBy: 'caption'"
                                    data-ng-click="filter.addFilter('location.city_code','in',getSelection(dictionary.city))"
                                    data-ng-model="dictionary.city[city.__$obj_key].selected"
                                    data-label="{{city.caption.replace('(' + region.caption +')','')}}"
                                    ></immodb-checkbox>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <!-- Price -->
    <div class="filter-panel price-panel {{isExpanded('price')}}">
        <button class="panel-trigger {{isExpanded('price')}} {{filterPanelHasFilters('price') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('price')"><?php _e('Price', IMMODB) ?></button>
        <div class="filter-panel-content">
            <div class="price-inputs">
                <immodb-slider model="priceRange" step="0.05" on-change="updatePrice()" start-label="Min" end-label="<?php _e('Unlimited',IMMODB) ?>"></immodb-slider>
                <div class="min">
                    <em><?php _e('Minimal price', IMMODB) ?></em>
                    <h2 class="price-value">{{getPriceFromScale(priceRange[0],10000)}}</h2>
                </div>
                
                <i class="price-divider fal fa-3x fa-arrows-h"></i>

                <div class="max">
                    <em><?php _e('Maximal price', IMMODB) ?></em>
                    <h2 class="price-value">{{getPriceFromScale(priceRange[2],-10000,1000000,'<?php _e('Unlimited',IMMODB) ?>')}}</h2>
                </div>

            </div>
        </div>
    </div>

    <!-- Category -->
    <div class="filter-panel categories-panel {{isExpanded('categories')}}">
        <button class="panel-trigger {{isExpanded('categories')}} {{filterPanelHasFilters('category') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('categories')"><?php _e('Home types', IMMODB) ?></button>
        <div class="filter-panel-content">
            <div class="tabs tabs-left">
                <div class="category tab-header with-title"">
                    <h4 class="title"><?php _e('Categories',IMMODB) ?></h4>
                    <div class="tab-item {{tab_category==key ? 'active' : ''}} {{item.selected || sublistHasFilters(key, dictionary.listing_subcategory) ? 'has-filters' : ''}}" 
                        data-ng-repeat="(key,item) in dictionary.listing_category"
                        data-ng-click="changeCategoryTab(key)">
                        <i class="far fa-fw fa-{{getCategoryIcon(key)}}"></i>
                        <label>{{item.caption}}</label>
                    </div>
                </div>
                <div class="subcategory tab-container {{category_key==tab_category ? 'opened' : ''}}"
                            ng-repeat="(category_key,category) in dictionary.listing_category">
                    <h4 class="title"><?php _e('Types',IMMODB) ?></h4>
                    
                    <div class="tab-title {{tab_category==category_key ? 'active' : ''}} {{category.selected || sublistHasFilters(category_key, dictionary.listing_subcategory) ? 'has-filters' : ''}}" 
                        data-ng-click="changeCategoryTab(category_key)">
                        <i class="far fa-fw fa-{{getCategoryIcon(category_key)}}"></i>
                        <label>{{category.caption}}</label>
                    </div>

                    <div class="tab-content">
                        <div class="check-list grid-layout-column {{category_key==tab_category ? 'opened' : ''}}">
                            <immodb-checkbox
                                ng-show="(subcategory_list | filter: {parent: category_key}).length==0"
                                data-ng-click="filter.addFilter('category_code','in',getSelection(dictionary.listing_category))"
                                data-ng-model="category.selected"
                                data-label="{{category.caption}}"
                                ></immodb-checkbox>
                            <immodb-checkbox
                                data-ng-repeat="item in subcategory_list | filter: {parent: tab_category} | orderBy: 'caption'"
                                data-ng-click="filter.addFilter('subcategory_code','in',getSelection(dictionary.listing_subcategory))"
                                data-ng-model="dictionary.listing_subcategory[item.__$obj_key].selected"
                                data-label="{{item.caption}}"
                                ></immodb-checkbox>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    </div>

    <!-- Rooms -->
    <div class="filter-panel rooms-panel {{isExpanded('rooms')}}">
        <button class="panel-trigger {{isExpanded('rooms')}} {{filterPanelHasFilters('room') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('rooms')"><?php _e('Rooms', IMMODB) ?></button>
        <div class="filter-panel-content">
            <div class="bedrooms">
                <h4><?php _e('Bedrooms',IMMODB) ?></h4>
                
            

                <immodb-radio
                        data-ng-repeat="item in bedroomSuggestions"
                        name="bedrooms-count"
                        data-ng-click="filter.addFilter('main_unit.bedroom_count','greater_or_equal_to',item.value, item.caption)"
                        data-ng-checked="filter.getFilterValue('main_unit.bedroom_count') == item.value"
                        data-label="{{item.label}}"
                    ></immodb-radio>

                <immodb-radio
                        name="bedrooms-count"
                        data-ng-click="filter.addFilter('main_unit.bedroom_count','greater_or_equal_to','')"
                        data-ng-checked="filter.getFilterValue('main_unit.bedroom_count') == null"
                        data-label="<?php _e('Any',IMMODB) ?>"
                    ></immodb-radio>
                
            </div>

            <div class="bathrooms">
                <h4><?php _e('Bathrooms',IMMODB) ?></h4>
                
                <immodb-radio
                        data-ng-repeat="item in bathroomSuggestions"
                        name="bathrooms-count"
                        data-ng-click="filter.addFilter('main_unit.bathroom_count','greater_or_equal_to',item.value, item.caption)"
                        data-ng-checked="filter.getFilterValue('main_unit.bathroom_count') == item.value"
                        data-label="{{item.label}}"
                    ></immodb-radio>

                <immodb-radio
                        name="bathrooms-count"
                        data-ng-click="filter.addFilter('main_unit.bathroom_count','greater_or_equal_to','')"
                        data-ng-checked="filter.getFilterValue('main_unit.bathroom_count') == null"
                        data-label="<?php _e('Any',IMMODB) ?>"
                    ></immodb-radio>

            </div>
        </div>
    </div>

    <!-- Mores -->
    <div class="filter-panel others-panel {{isExpanded('others')}}">
        <button class="panel-trigger {{isExpanded('others')}} {{filterPanelHasFilters('other') ? 'has-filters' : ''}}" type="button"  ng-click="toggleExpand('others')"><?php _e('More', IMMODB) ?></button>
        <div class="filter-panel-content">
            <div class="age grid-layout-column">
                <h4><?php _e('Online for',IMMODB) ?></h4>

                <div class="immodb-dropdown" data-has-value="{{filter.getFilterValue('contract.start_date')}}">
                    <button class="button" type="button">{{filter.getFilterCaptionFromList('contract.start_date',listing_ages,listing_ages[0].caption)}}</button>
                    <div class="immodb-dropdown-panel">
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
                <h4><?php _e('Parkings',IMMODB) ?></h4>
                
                <div class="immodb-dropdown" data-has-value="{{filter.getFilterValue('attributes.PARKING')}}">
                    <button class="button" type="button">{{filter.getFilterCaptionFromList('attributes.PARKING',parkingSuggestions, '<?php _e('Any',IMMODB) ?>')}}</button>
                    <div class="immodb-dropdown-panel">
                        <div class="dropdown-item
                                {{filter.getFilterValue('attributes.PARKING') == null ? 'active' : ''}}"
                            data-ng-click="filter.addFilter('attributes.PARKING','greater_or_equal_to',item.value, '')">
                            <?php _e('Any',IMMODB) ?>
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
                <h4><?php _e('Building type',IMMODB) ?></h4>
                <div class="dropdown-divider"></div>

                <immodb-checkbox
                    data-ng-repeat="(key,item) in dictionary.building_category"
                    data-ng-click="filter.addFilter('building.category_code','in',filter.getSelection(dictionary.building_category))"
                    data-ng-model="item.selected"
                    data-label="{{item.caption.translate()}}"
                    ></immodb-checkbox>
            </div>


            <div class="attribute grid-layout-column">
                <h4><?php _e('Caracteristics',IMMODB) ?></h4>
                <div class="dropdown-divider"></div>
                
                <immodb-checkbox
                    data-ng-repeat="(key,item) in listing_attributes"
                    data-ng-click="filter.addAttributeFilter(item)"
                    data-ng-model="item.selected"
                    data-label="{{item.caption.translate()}}"
                    ></immodb-checkbox>

               
            </div>

            <div class="transaction grid-layout-column">
                <h4><?php _e('Filters',IMMODB) ?></h4>
                <div class="dropdown-divider"></div>
                <immodb-checkbox
                    data-ng-repeat="(key,item) in listing_states"
                    data-ng-click="setState(item)"
                    data-ng-model="item.selected"
                    data-label="{{item.caption.translate()}}"
                    ></immodb-checkbox>
                 
            </div>
        </div>
    </div>
        

    <div class="client-filters" ng-show="filter.hasFilters()">
        <div class="label"><?php _e('Selected filters', IMMODB) ?></div>
        <div class="list">
            <div class="item" data-ng-repeat="item in filterHints">{{item.label}} <i class="fas fa-times" data-ng-click="item.reverse()"></i></div>
        </div>
        <div class="reset"><button type="button" class="button" data-ng-click="resetFilters()"><?php _e('Reset', IMMODB) ?></button></div>
    </div>