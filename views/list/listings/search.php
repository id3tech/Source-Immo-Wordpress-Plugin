    

    <div class="search-box">
        
        <si-search-box 
                alias="<?php echo $configs->alias ?>" 
                placeholder="<?php _e('Search a region, city, street',SI) ?>"></si-search-box>
        
        <i class="geo-btn far fa-crosshairs {{data.location!=null ? 'active' : ''}}" data-ng-show="geolocation_available" data-ng-click="filter.addGeoFilter()"></i>
    </div>

    <div class="advanced">
        <div class="si-button cities {{isExpanded('cities')}} {{filter.hasFilter(['location.region_code','location.city_code']) ? 'has-filters' : ''}}"  
                ng-click="toggleExpand($event,'cities')"><?php _e('Cities', SI) ?></div>
    
        <div class="si-button price {{isExpanded('price')}} {{filter.hasFilter('price.sell.amount') ? 'has-filters' : ''}}"  
                ng-click="toggleExpand($event,'price')"><?php _e('Price', SI) ?></div>
    
        <div class="si-button category {{isExpanded('categories')}} {{filter.hasFilter(['category_code','subcategory_code']) ? 'has-filters' : ''}}"  
                ng-click="toggleExpand($event,'categories')"><?php _e('Home types', SI) ?></div>
        
        <div class="si-button rooms {{isExpanded('rooms')}} {{filter.hasFilter(['main_unit.bedroom_count','main_unit.bathroom_count']) ? 'has-filters' : ''}}"  
                ng-click="toggleExpand($event,'rooms')"><?php _e('Rooms', SI) ?></div>
        
        <div class="si-button more {{isExpanded('others')}} {{filter.hasFilter(['contract.start_date','attributes.*','building.category_code','status_code','*_flag','open_houses*','price.foreclosure']) ? 'has-filters' : ''}}"  
                ng-click="toggleExpand($event,'others')"><?php _e('More', SI) ?></div>
    
        <div class="filter-menu">
            <div class="si-dropdown" data-show-button-icon="false">
                <div class="dropdown-button {{filter.hasFilters() ? 'active' : ''}}" type="button"><i class="fal fa-filter"></i></div>
                <div class="si-dropdown-panel">
                    <div class="dropdown-item {{filter.hasFilter(['location.region_code','location.city_code']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'cities')"><?php _e('Cities', SI) ?></div>
                    <div class="dropdown-item {{filter.hasFilter('price.sell.amount') ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'price')"><?php _e('Price', SI) ?></div>
                    <div class="dropdown-item {{filter.hasFilter(['category_code','subcategory_code']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'categories')"><?php _e('Home types', SI) ?></div>
                    <div class="dropdown-item {{filter.hasFilter(['main_unit.bedroom_count','main_unit.bathroom_count']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'rooms')"><?php _e('Rooms', SI) ?></div>
                    <div class="dropdown-item {{filter.hasFilter(['contract.start_date','attributes.*','building.category_code','status_code','*_flag','open_houses*','price.foreclosure']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'others')"><?php _e('More', SI) ?></div>
                </div>
            </div>
        </div>

        <div class="search-trigger">
            <button type="button" class="trigger-button button" data-ng-click="showResultPage()"><?php _e('Search', SI) ?></button>
        </div>

        
    </div>


    <!-- Cities -->
    <div class="filter-panel cities-panel {{isExpanded('cities')}}">
        <div class="panel-header">
            <h4><?php _e('Cities', SI) ?></h4>
            <button class="button" type="button"  ng-click="toggleExpand($event,'cities')"><i class="fal fa-times"></i></button>
        </div>
        
        <div class="filter-panel-content">
            
            <div class="panel-list region-city-list">                 
                <div class="list-container regions">
                    <div class="list-item region {{region.selected || filter.sublistHasFilters(region.__$obj_key, city_list) ? 'has-filters' : ''}}" 
                        data-ng-repeat="region in region_list | orderObjectBy: 'caption'" 
                        >

                        <div class="list-item-title region-name " 
                                data-ng-click="expandSublist(region_list,region)"
                                data-ng-click-off="changeRegionTab(region.__$obj_key)">
                            <h5>{{region.caption}}</h5>                                
                        </div>

                        <div class="sublist region-cities {{region.expanded ? 'expanded' : ''}}" 
                            style="--item-count:{{(city_list | filter : {parent: region.__$obj_key}).length}}">

                            <div class="sublist-container city-container">
                                <si-checkbox class="sublist-all"
                                    data-label="{{'All cities'.translate()}}" 
                                    data-ng-model="region.selected"
                                    data-ng-click="filter.addFilter('location.region_code','in',getSelection(region_list))"></si-checkbox>

                                <si-checkbox
                                    data-ng-repeat="city in city_list | filter : {parent: region.__$obj_key} | orderBy: 'caption'"
                                    data-ng-click="filter.addFilter('location.city_code','in',getSelection(city_list))"
                                    data-ng-model="city.selected"
                                    ng-disabled="region.selected"
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
        <div class="panel-header">
            <h4><?php _e('Price', SI) ?></h4>
            <button class="button" type="button"  ng-click="toggleExpand($event,'price')"><i class="fal fa-times"></i></button>
        </div>
    
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
    <div class="filter-panel categories-panel {{isExpanded('categories')}} ">
        <div class="panel-header">
            <h4><?php _e('Home types', SI) ?></h4>
            <button class="button" type="button"  ng-click="toggleExpand($event,'categories')"><i class="fal fa-times"></i></button>
        </div>
        
        <div class="filter-panel-content">
            <div class="panel-list">
                <div class="list-container">
                    <div class="list-item category {{category.selected || filter.sublistHasFilters(category_code, dictionary.listing_subcategory) ? 'has-filters' : ''}}" 
                        data-ng-repeat="(category_code,category) in dictionary.listing_category">
                        <div class="list-item-title category-name"
                            data-ng-click="expandSublist(dictionary.listing_category, category,category_code)">
                            <h5><i class="far fa-fw fa-{{getCategoryIcon(category_code)}}"></i> {{category.caption}}</h5>
                        </div>

                        <div class="sublist category-subcategories {{category.expanded ? 'expanded' : ''}}"
                            style="--item-count:{{(subcategory_list | filter : {parent: category_code}).length}}">
                            <div class="sublist-container subcategory-container">
                                <si-checkbox
                                    class="sublist-all"
                                    data-ng-click="filter.addFilter('category_code','in',getSelection(dictionary.listing_category))"
                                    data-ng-model="category.selected"
                                    data-label="<?php _e('All', SI) ?> {{category.caption.toLowerCase()}}"
                                    ></si-checkbox>
                                <si-checkbox
                                    data-ng-repeat="item in subcategory_list | filter: {parent: category_code} | orderBy: 'caption'"
                                    data-ng-click="filter.addFilter('subcategory_code','in',getSelection(dictionary.listing_subcategory))"
                                    ng-disabled="category.selected"
                                    data-ng-model="dictionary.listing_subcategory[item.__$obj_key].selected"
                                    data-label="{{item.caption}}"
                                    ></si-checkbox>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Rooms -->
    <div class="filter-panel rooms-panel {{isExpanded('rooms')}}">
        <div class="panel-header">
            <h4><?php _e('Rooms', SI) ?></h4>
            <button class="button" type="button"  ng-click="toggleExpand($event,'rooms')"><i class="fal fa-times"></i></button>
        </div>

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
        <div class="panel-header">
            <h4><?php _e('More', SI) ?></h4>
            <button class="button" type="button"  ng-click="toggleExpand($event,'others')"><i class="fal fa-times"></i></button>
        </div>
        
        <div class="filter-panel-content">
            
            
            <div class="age grid-layout-column">
                <h4><?php _e('Online for',SI) ?></h4>

                <div class="si-dropdown" data-has-value="{{filter.getFilterValue('contract.start_date')}}">
                    <div class="dropdown-button" type="button">{{filter.getFilterCaptionFromList('contract.start_date',listing_ages,listing_ages[0].caption)}}</div>
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
                    <div class="dropdown-button" type="button">{{filter.getFilterCaptionFromList('attributes.PARKING',parkingSuggestions, '<?php _e('Any',SI) ?>')}}</div>
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
                <si-checkbox
                    data-ng-show="hasFavorites()"
                    data-ng-click="filter.addFilter('ref_number','in', getFavorites('ref_number'),'My favorites'.translate())"
                    data-label="{{'My favorites'.translate()}}"
                    data-si-checked="{{filter.hasFilter('ref_number')}}"></si-checkbox>
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