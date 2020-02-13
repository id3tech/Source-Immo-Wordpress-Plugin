<div class="category-tabs">
        <div class="tab {{category_code == selected_category ? 'selected' : ''}}" 
                        data-ng-repeat="(category_code,category) in dictionary.listing_category"
                        ng-if="['RESIDENTIAL','COM','IND'].includes(category_code)"
                        ng-click="selectCategory(category_code)"
                        >
            <span class="category-name">{{category.caption}}</span>
        </div>

        <div class="tab {{selected_category == 'OTHER' ? 'selected' : ''}}" 
                        ng-click="selectCategory('OTHER')">
            <span class="category-name"><?php _e('Other', SI) ?></span>
        </div>
    </div>
    
    <div class="search-box">
        
        <si-search-box 
                alias="<?php echo $configs->alias ?>" 
                placeholder="<?php _e('Search a region, city, street',SI) ?>"></si-search-box>
        
        <i class="geo-btn far fa-crosshairs {{data.location!=null ? 'active' : ''}}" data-ng-show="geolocation_available" data-ng-click="filter.addGeoFilter()"></i>
    </div>

    <div class="advanced cat-{{selected_category}}">
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

    <div class="search-trigger">
        <button type="button" class="trigger-button button" data-ng-click="showResultPage()"><?php _e('Search', SI) ?></button>
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

    

    <!-- Mores -->
    <?php
    SourceImmo::view("list/listings/search/panels/other");
    ?>
        

    <div class="client-filters" ng-show="filter.hasFilters()">
        <div class="label"><?php _e('Selected filters', SI) ?></div>
        <div class="list">
            <div class="item" data-ng-repeat="item in filterHints" data-ng-click="item.reverse()">{{item.label}} <i class="fas fa-times"></i></div>
        </div>
        <div class="reset"><button type="button" class="button" data-ng-click="resetFilters()"><?php _e('Reset', SI) ?></button></div>
    </div>
