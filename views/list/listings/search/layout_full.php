    <div class="main-filter-tabs si-tab-count-{{configs.search_engine_options.tabs.length}}" ng-if="configs.search_engine_options.tabbed">
        <div ng-repeat="tab in configs.search_engine_options.tabs track by $index"
                class="si-tab {{configs.current_view == tab.view_id ? 'active' : ''}}"
                ng-click="selectView(tab.view_id)"
                >
                {{tab.caption | translate}}
        </div>

        <div class="si-dropdown" data-show-button-icon="false">
            <div class="si-dropdown-button"><i class="far fa-ellipsis-h"></i></div>
            <div class="si-dropdown-panel">
                <div class="si-dropdown-item {{configs.current_view == tab.view_id ? 'active' : ''}}" 
                        ng-repeat="tab in configs.search_engine_options.tabs track by $index"
                        ng-click="selectView(tab.view_id)">
                        {{tab.caption | translate}}</div>
            </div>
        </div>
        
    </div>

    <div class="inputs">
        <div class="search-box">
            
            <si-search-box 
                    alias="<?php echo $configs->alias ?>"></si-search-box>
            
            
        </div>

        <si-geo-filter si-alias="<?php echo $configs->alias ?>"></si-geo-filter>

        <div class="si-panel-button si-hover-shade cities-button {{isExpanded('cities')}} {{filter.hasFilter(['regions','cities']) ? 'has-filters' : ''}}"  
                ng-if="allowPanel('cities')"
                ng-click="toggleExpand($event,'cities')"><span si-pluralize="{on:'dictionary/city', label:'<?php si_label('Cities') ?>'}"><?php si_label('City') ?></span> <i class="fal fa-angle-down"></i></div>
    
        <div class="si-panel-button si-hover-shade price-button {{isExpanded('price')}} {{filter.hasFilter(['min_price','max_price']) ? 'has-filters' : ''}}"  
                ng-if="allowPanel('price')"
                ng-click="toggleExpand($event,'price')"><span><?php si_label('Price') ?></span> <i class="fal fa-angle-down"></i></div>
    
        <div class="si-panel-button si-hover-shade category-button {{isExpanded('categories')}} {{filter.hasFilter(['categories','building_categories','subcategories']) ? 'has-filters' : ''}}"  
                ng-if="allowPanel('categories')"
                ng-click="toggleExpand($event,'categories')"><span si-pluralize="{on:['dictionary/listing_subcategory','dictionary/building_category'], label:'<?php si_label('Types') ?>'}"><?php si_label('Type') ?></span> <i class="fal fa-angle-down"></i></div>
        
        
        <div class="si-panel-button si-hover-shade areas-button {{isExpanded('areas')}} {{filter.hasFilter(['available_min','available_max','land_min','land_max']) ? 'has-filters' : ''}}" 
                ng-if="allowPanel('areas')"
                ng-click="toggleExpand($event,'areas')"><span><?php si_label('Areas') ?></span> <i class="fal fa-angle-down"></i></div>

        
        <div class="si-panel-button si-hover-shade more-button {{isExpanded('others')}} 
                {{ filter.hasFilter(getOtherPanelFilterList()) ? 'has-filters' : '' }}"
                ng-click="toggleExpand($event,'others')"><i class="fal fa-ellipsis-h-alt"></i></div>
    

        
    </div>
    

    <div class="search-action">
        <button type="button" class="reset-button si-button" data-ng-if="filter.hasFilters()" data-ng-click="resetFilters()" title="<?php si_label('Reset') ?>"><i class="fal fa-undo"></i></button>
        
        
        <div class="filter-menu">
            <div class="si-dropdown" data-show-button-icon="false">
                <div class="si-dropdown-button si-element {{filter.hasFilters() ? 'active' : ''}}"><span class="label"><?php si_label("Filters") ?></span> <i class="fal fa-filter"><b ng-if="filter.hasFilters()">{{filter.count()}}</b></i></div>
                <div class="si-dropdown-panel">
                    <div class="si-dropdown-item {{filter.hasFilter(['regions','cities']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'cities')"><?php si_label('Cities') ?></div>
                    <div class="si-dropdown-item {{filter.hasFilter(['min_price','max_price']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'price')"><?php si_label('Price') ?></div>
                    <div class="si-dropdown-item {{filter.hasFilter(['categories','subcategories']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'categories')"><?php si_label('Home types') ?></div>
                    <div class="si-dropdown-item 
                        {{filter.hasFilter(getOtherPanelFilterList()) ? 'has-filters' : '' }}" 
                        ng-click="toggleExpand($event,'others')"><?php si_label('More') ?></div>

                    <div class="si-dropdown-item reset-option" ng-if="filter.hasFilters()" ng-click="resetFilters()"><?php si_label('Reset filters') ?></div>
                </div>
            </div>
        </div>
        
        <button type="button" class="trigger-button si-button" data-ng-show="result_url != null" data-ng-click="showResultPage()" title="<?php si_label('Search') ?>"><span class="label"><?php si_label('Search') ?></span> <i class="fal fa-search"></i></button>
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


    
    <!-- Category -->
    <?php
    SourceImmo::view("list/listings/search/panels/categories");
    ?>


    
    <!-- Price -->
    <?php
    SourceImmo::view("list/listings/search/panels/price");
    ?>

    <!-- Areas -->
    <?php
    SourceImmo::view("list/listings/search/panels/areas");
    ?>
    

    <!-- Mores -->
    <?php
    SourceImmo::view("list/listings/search/panels/other");