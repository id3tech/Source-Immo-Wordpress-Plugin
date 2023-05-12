

    <div class="si-main-filter-tabs si-tab-count-{{configs.search_engine_options.tabs.length}}" ng-if="configs.search_engine_options.tabbed">
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

    <div class="si-inputs">
        <div class="si-search-box">
            
            <si-search-box 
                    alias="<?php echo $configs->alias ?>"></si-search-box>
            
            
        </div>

        
        <div class="si-panel-button si-element-padding-block-sm si-element-padding areas-button {{isExpanded('agencies')}} {{filter.hasFilter(['agencies']) ? 'si-has-filters' : ''}}" 
                ng-if="false && allowPanel('agencies')"
                ng-click="toggleExpand($event,'agencies')"><span><?php si_label('Agencies') ?></span> <i class="fal fa-angle-down"></i></div>

        
        <div ng-if="false" class="si-panel-button si-element-padding-block-sm si-element-padding more-button {{isExpanded('others')}} 
                {{ filter.hasFilter(getOtherPanelFilterList()) ? 'si-has-filters' : '' }}"
                ng-click="toggleExpand($event,'others')"><i class="fal fa-ellipsis-h-alt"></i></div>
    

        
    </div>
    

    <div class="si-search-action">
        <button type="button" class="reset-button si-button" data-ng-if="filter.hasFilters()" data-ng-click="resetFilters()" title="<?php si_label('Reset') ?>"><i class="fal fa-undo"></i></button>
        
        
        <div ng-if="false" class="si-filter-menu">
            <div class="si-dropdown" data-show-button-icon="false">
                <div class="si-dropdown-button si-element {{filter.hasFilters() ? 'active' : ''}}"><span class="label"><?php si_label("Filters") ?></span> <i class="fal fa-filter"><b ng-if="filter.hasFilters()">{{filter.count()}}</b></i></div>
                <div class="si-dropdown-panel">
                    <div class="si-dropdown-item {{filter.hasFilter(['agencies']) ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'agencies')"><?php si_label('Agencies') ?></div>
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
//    SourceImmo::view("list/offices/search/panels/agencies");
    ?>

    <!-- Mores -->
    <?php
    //SourceImmo::view("list/listings/search/panels/other");