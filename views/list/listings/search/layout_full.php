

    <div class="main-filter-tabs">
        <div class="tab {{current_main_filter == 'for-sale' ? 'active' : ''}}"
                ng-click="selectMainFilter('for-sale')" 
                ng-if="configs.search_engine_options.tabs.includes('for-sale')"><?php _e('For sale',SI) ?></div>
        <div class="tab {{current_main_filter == 'for-rent' ? 'active' : ''}}" 
                ng-click="selectMainFilter('for-rent')"
                ng-if="configs.search_engine_options.tabs.includes('for-rent')"><?php _e('For rent',SI) ?></div>
        <div class="tab {{current_main_filter == 'residential' ? 'active' : ''}}" 
                ng-click="selectMainFilter('residential')"
                ng-if="configs.search_engine_options.tabs.includes('residential')"><?php _e('Residential',SI) ?></div>
        <div class="tab {{current_main_filter == 'commercial' ? 'active' : ''}}"
                ng-click="selectMainFilter('commercial')" 
                ng-if="configs.search_engine_options.tabs.includes('commercial')"><?php _e('Commercial',SI) ?></div>
        <div class="tab {{current_main_filter == 'others' ? 'active' : ''}}" 
                ng-click="selectMainFilter('others')"
                ng-if="configs.search_engine_options.tabs.includes('others')"><?php _e('Others',SI) ?></div>
        
        <si-select si-model="current_main_filter" si-change="selectMainFilter(current_main_filter)">
                <si-option value="for-sale"
                        ng-if="configs.search_engine_options.tabs.includes('for-sale')"><?php _e('For sale',SI) ?></si-option>
                <si-option value="for-rent"
                        ng-if="configs.search_engine_options.tabs.includes('for-rent')"><?php _e('For rent',SI) ?></si-option>
                <si-option value="residential"
                        ng-if="configs.search_engine_options.tabs.includes('residential')"><?php _e('Residential',SI) ?></si-option>
                <si-option value="commercial"
                        ng-if="configs.search_engine_options.tabs.includes('commercial')"><?php _e('Commercial',SI) ?></si-option>
                <si-option value="others"
                        ng-if="configs.search_engine_options.tabs.includes('others')"><?php _e('Others',SI) ?></si-option>
                
        </si-select>
    </div>

    <div class="inputs" style="--input-count: {{getInputCount()}}">
        <div class="search-box">
            
            <si-search-box 
                    alias="<?php echo $configs->alias ?>" 
                    placeholder="<?php _e('Search a region, city, street',SI) ?>"></si-search-box>
            
            <i class="geo-btn far fa-crosshairs {{data.location!=null ? 'active' : ''}}" data-ng-show="geolocation_available" data-ng-click="filter.addGeoFilter()"></i>
        </div>

        <div class="si-panel-button cities {{isExpanded('cities')}} {{filter.hasFilter(['regions','cities']) ? 'has-filters' : ''}}"  
                ng-click="toggleExpand($event,'cities')"><?php _e('Cities', SI) ?></div>
    
        <div class="si-panel-button price {{isExpanded('price')}} {{filter.hasFilter(['min_price','max_price']) ? 'has-filters' : ''}}"  
                ng-click="toggleExpand($event,'price')"><?php _e('Price', SI) ?></div>
    
        <div class="si-panel-button category {{isExpanded('categories')}} {{filter.hasFilter(['building_categories','subcategories']) ? 'has-filters' : ''}}"  
                ng-click="toggleExpand($event,'categories')"><?php _e('Types', SI) ?></div>
        
        <div class="si-panel-button rooms {{isExpanded('rooms')}} {{filter.hasFilter(['bedrooms','bathrooms']) ? 'has-filters' : ''}}"
                ng-if="isMainFiltered([null, 'residential','for-sale','for-rent'])"
                ng-click="toggleExpand($event,'rooms')"><?php _e('Rooms', SI) ?></div>

        <div class="si-panel-button areas {{isExpanded('areas')}} {{filter.hasFilter(['available_min','available_max','land_min','land_max']) ? 'has-filters' : ''}}" 
                ng-if="isMainFiltered(['commercial'])"
                ng-click="toggleExpand($event,'areas')"><?php _e('Areas', SI) ?></div>

        
        <div class="si-panel-button more {{isExpanded('others')}} 
                {{ isMainFiltered(['commercial']) ? filter.hasFilter(['transaction_type','states','attributes','parkings','contract']) ? 'has-filters' : '' : ''}}
                {{ isMainFiltered(['residential']) ? filter.hasFilter(['transaction_type','states','attributes','parkings','contract', 'available_min','available_max','land_min','land_max']) ? 'has-filters' : '' : ''}}
                {{ isMainFiltered(['for-rent','for-sale']) ? filter.hasFilter(['states','attributes','parkings','contract', 'available_min','available_max','land_min','land_max']) ? 'has-filters' : '' : ''}}
                "
                ng-click="toggleExpand($event,'others')"><?php _e('More', SI) ?></div>
    

        
    </div>
    

    <div class="search-action">
        <button type="button" class="trigger-button si-button" data-ng-show="result_url != null" data-ng-click="showResultPage()" title="<?php _e('Search', SI) ?>"><i class="fal fa-search"></i></button>
        <button type="button" class="reset-button si-button" data-ng-show="filter.hasFilters()" data-ng-click="resetFilters()" title="<?php _e('Reset', SI) ?>"><i class="fal fa-undo"></i></button>

        <div class="filter-menu">
            <div class="si-dropdown" data-show-button-icon="false">
                <div class="dropdown-button {{filter.hasFilters() ? 'active' : ''}}"><i class="fal fa-filter"></i></div>
                <div class="si-dropdown-panel">
                    <div class="dropdown-item {{filter.hasFilter(['location.region_code','location.city_code']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'cities')"><?php _e('Cities', SI) ?></div>
                    <div class="dropdown-item {{filter.hasFilter('price.sell.amount') ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'price')"><?php _e('Price', SI) ?></div>
                    <div class="dropdown-item {{filter.hasFilter(['category_code','subcategory_code']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'categories')"><?php _e('Home types', SI) ?></div>
                    <div class="dropdown-item {{filter.hasFilter(['main_unit.bedroom_count','main_unit.bathroom_count']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'rooms')"><?php _e('Rooms', SI) ?></div>
                    <div class="dropdown-item {{filter.hasFilter(['contract.start_date','attributes.*','building.category_code','status_code','*_flag','open_houses*','price.foreclosure']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'others')"><?php _e('More', SI) ?></div>
                </div>
            </div>
        </div>
    
    </div>


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
        

