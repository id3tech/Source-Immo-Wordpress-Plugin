

    <div class="main-filter-tabs si-tab-count-{{configs.search_engine_options.tabs.length}}">
        <div ng-repeat="tab in configs.search_engine_options.tabs track by $index"
                class="si-tab {{current_view == tab.view_id ? 'active' : ''}}"
                ng-click="selectView(tab.view_id)"
                >
                {{tab.caption | translate}}
        </div>


        <!-- <div class="si-tab {{current_main_filter == 'for-sale' ? 'active' : ''}}"
                ng-click="selectMainFilter('for-sale')" 
                ng-if="configs.search_engine_options.tabs.includes('for-sale')"><?php _e('For sale',SI) ?></div>
        <div class="si-tab {{current_main_filter == 'for-rent' ? 'active' : ''}}" 
                ng-click="selectMainFilter('for-rent')"
                ng-if="configs.search_engine_options.tabs.includes('for-rent')"><?php _e('For rent',SI) ?></div>
        <div class="si-tab {{current_main_filter == 'RES' ? 'active' : ''}}" 
                ng-click="selectMainFilter('RES')"
                ng-if="configs.search_engine_options.tabs.includes('RES')"><?php _e('Residential',SI) ?></div>
        <div class="si-tab {{current_main_filter == 'COM' ? 'active' : ''}}"
                ng-click="selectMainFilter('COM')" 
                ng-if="configs.search_engine_options.tabs.includes('COM')"><?php _e('Commercial',SI) ?></div>
        <div class="si-tab {{current_main_filter == 'IND' ? 'active' : ''}}" 
                ng-click="selectMainFilter('IND')"
                ng-if="configs.search_engine_options.tabs.includes('IND')"><?php _e('Industrial',SI) ?></div> -->
        
        <si-select si-model="current_main_filter" si-change="selectMainFilter(current_main_filter)">
                <si-option value="for-sale"
                        ng-if="configs.search_engine_options.tabs.includes('for-sale')"><?php _e('For sale',SI) ?></si-option>
                <si-option value="for-rent"
                        ng-if="configs.search_engine_options.tabs.includes('for-rent')"><?php _e('For rent',SI) ?></si-option>
                <si-option value="RES"
                        ng-if="configs.search_engine_options.tabs.includes('RES')"><?php _e('Residential',SI) ?></si-option>
                <si-option value="COM"
                        ng-if="configs.search_engine_options.tabs.includes('COM')"><?php _e('Commercial',SI) ?></si-option>
                <si-option value="IND"
                        ng-if="configs.search_engine_options.tabs.includes('IND')"><?php _e('Others',SI) ?></si-option>
                
        </si-select>
    </div>

    <div class="inputs" style="--input-count: {{getInputCount()}}">
        <div class="search-box">
            
            <si-search-box 
                    alias="<?php echo $configs->alias ?>" 
                    placeholder="<?php _e('Search a region, city, street',SI) ?>"></si-search-box>
            
            <i class="geo-btn far fa-crosshairs {{data.location!=null ? 'active' : ''}}" data-ng-show="geolocation_available" data-ng-click="filter.addGeoFilter()"></i>
        </div>

        <div class="si-panel-button cities-button {{isExpanded('cities')}} {{filter.hasFilter(['regions','cities']) ? 'has-filters' : ''}}"  
                ng-click="toggleExpand($event,'cities')"><?php _e('Cities', SI) ?></div>
    
        <div class="si-panel-button price-button {{isExpanded('price')}} {{filter.hasFilter(['min_price','max_price']) ? 'has-filters' : ''}}"  
                ng-click="toggleExpand($event,'price')"><?php _e('Price', SI) ?></div>
    
        <div class="si-panel-button category-button {{isExpanded('categories')}} {{filter.hasFilter(['categories','building_categories','subcategories']) ? 'has-filters' : ''}}"  
                ng-click="toggleExpand($event,'categories')"><?php _e('Types', SI) ?></div>
        
        <div class="si-panel-button rooms-button {{isExpanded('rooms')}} {{filter.hasFilter(['bedrooms','bathrooms']) ? 'has-filters' : ''}}"
                ng-if="isMainFiltered([null, 'RES','for-sale','for-rent'])"
                ng-click="toggleExpand($event,'rooms')"><?php _e('Rooms', SI) ?></div>

        <div class="si-panel-button areas-button {{isExpanded('areas')}} {{filter.hasFilter(['available_min','available_max','land_min','land_max']) ? 'has-filters' : ''}}" 
                ng-if="isMainFiltered(['COM'])"
                ng-click="toggleExpand($event,'areas')"><?php _e('Areas', SI) ?></div>

        
        <div class="si-panel-button more-button {{isExpanded('others')}} 
                {{ isMainFiltered(['COM']) ? filter.hasFilter(['transaction_type','states','attributes','parkings','contract']) ? 'has-filters' : '' : ''}}
                {{ isMainFiltered(['RES']) ? filter.hasFilter(['transaction_type','states','attributes','parkings','contract', 'available_min','available_max','land_min','land_max']) ? 'has-filters' : '' : ''}}
                {{ isMainFiltered(['for-rent','for-sale']) ? filter.hasFilter(['states','attributes','parkings','contract', 'available_min','available_max','land_min','land_max']) ? 'has-filters' : '' : ''}}
                {{ isMainFiltered([null]) ? filter.hasFilter(['transaction_type','states','attributes','parkings','contract', 'available_min','available_max','land_min','land_max']) ? 'has-filters' : '' : ''}}
                "
                ng-click="toggleExpand($event,'others')"><?php _e('More', SI) ?></div>
    

        
    </div>
    

    <div class="search-action">
        <button type="button" class="reset-button si-button" data-ng-if="filter.hasFilters()" data-ng-click="resetFilters()" title="<?php _e('Reset', SI) ?>"><i class="fal fa-undo"></i></button>
        
        
        <div class="filter-menu">
            <div class="si-dropdown" data-show-button-icon="false">
                <div class="dropdown-button {{filter.hasFilters() ? 'active' : ''}}"><span class="label"><?php _e('Filter',SI) ?></span> <i class="fal fa-filter"><b ng-if="filter.hasFilters()">{{filter.count()}}</b></i></div>
                <div class="si-dropdown-panel">
                    <div class="dropdown-item {{filter.hasFilter(['regions','cities']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'cities')"><?php _e('Cities', SI) ?></div>
                    <div class="dropdown-item {{filter.hasFilter(['min_price','max_price']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'price')"><?php _e('Price', SI) ?></div>
                    <div class="dropdown-item {{filter.hasFilter(['categories','subcategories']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'categories')"><?php _e('Home types', SI) ?></div>
                    <div class="dropdown-item {{filter.hasFilter(['bedrooms','bathrooms']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'rooms')"><?php _e('Rooms', SI) ?></div>
                    <div class="dropdown-item 
                        {{ isMainFiltered(['COM']) ? filter.hasFilter(['transaction_type','states','attributes','parkings','contract']) ? 'has-filters' : '' : ''}}
                        {{ isMainFiltered(['RES']) ? filter.hasFilter(['transaction_type','states','attributes','parkings','contract', 'available_min','available_max','land_min','land_max']) ? 'has-filters' : '' : ''}}
                        {{ isMainFiltered(['for-rent','for-sale']) ? filter.hasFilter(['states','attributes','parkings','contract', 'available_min','available_max','land_min','land_max']) ? 'has-filters' : '' : ''}}" 
                        ng-click="toggleExpand($event,'others')"><?php _e('More', SI) ?></div>

                    <div class="dropdown-item reset-option" ng-if="filter.hasFilters()" ng-click="resetFilters()"><?php _e('Reset filters', SI) ?></div>
                </div>
            </div>
        </div>
        
        <button type="button" class="trigger-button si-button" data-ng-show="result_url != null" data-ng-click="showResultPage()" title="<?php _e('Search', SI) ?>"><span class="label"><?php _e('Search',SI) ?></span> <i class="fal fa-search"></i></button>
    </div>

    <?php
    if($configs->search_engine_options->filter_tags == 'inside'){
        echo('<si-search-filter-tags si-alias="' . $configs->alias . '"></si-search-filter-tags>');
    }
    ?>


    <!-- Cities -->
    <?php
    SourceImmo::view("list/listings/search/panels/cities");
    ?>


    <!-- Price -->
    <?php
    SourceImmo::view("list/listings/search/panels/price");
    ?>

    
    <!-- Category -->
    <?php
    SourceImmo::view("list/listings/search/panels/categories");
    ?>


    <!-- Rooms -->
    <?php
    SourceImmo::view("list/listings/search/panels/rooms");
    ?>


    <!-- Areas -->
    <?php
    SourceImmo::view("list/listings/search/panels/areas");
    ?>
    

    <!-- Mores -->
    <?php
    SourceImmo::view("list/listings/search/panels/other");
    ?>
        

