<div class="main-filter-tabs si-tab-count-{{configs.search_engine_options.tabs.length}}"
        ng-if="configs.search_engine_options.tabbed">
    <div ng-repeat="tab in configs.search_engine_options.tabs track by $index"
            class="si-tab {{configs.current_view == tab.view_id ? 'active' : ''}}"
            ng-click="selectView(tab.view_id)"
            >
            {{tab.caption | translate}}
    </div>

    <div class="si-dropdown" data-show-button-icon="false">
        <div class="dropdown-button"><i class="far fa-ellipsis-h"></i></div>
        <div class="si-dropdown-panel">
            <div class="dropdown-item {{configs.current_view == tab.view_id ? 'active' : ''}}" 
                    ng-repeat="tab in configs.search_engine_options.tabs track by $index"
                    ng-click="selectView(tab.view_id)">
                    {{tab.caption | translate}}</div>
        </div>
    </div>
    
</div>

<div class="inputs {{(!isFieldFiltered('searchbox')) ? 'no-searchbox' : ''}}" style="--input-count: {{getInputCount()}}">
    <div class="search-box" ng-if="isFieldFiltered('searchbox')" >
        <si-search-box
            alias="<?php echo $configs->alias ?>" 
            placeholder="<?php _e('Search by first or last name',SI) ?>"></si-search-box>

    </div>

    <div class="si-panel-button si-hover-shade letters {{isExpanded('letters')}} {{filter.hasFilter('letters') ? 'has-filters' : ''}}"  
        ng-click="toggleExpand($event,'letters')"
        ng-if="isFieldFiltered('letters')"><span><?php _e('Letter', SI) ?></span> <i class="fal fa-angle-down"></i></div>
    <div class="si-panel-button si-hover-shade offices {{isExpanded('offices')}} {{filter.hasFilter('offices') ? 'has-filters' : ''}}" 
        ng-show="officeList.length > 1"
        ng-if="isFieldFiltered('offices')"
         ng-click="toggleExpand($event,'offices')"><span><?php _e('Offices', SI) ?></span> <i class="fal fa-angle-down"></i></div>

    <div class="si-panel-button si-hover-shade more-button {{isExpanded('others')}} 
        {{ filter.hasFilter(getOtherPanelFilterList()) ? 'has-filters' : '' }}"
        ng-click="toggleExpand($event,'others')"><i class="fal fa-ellipsis-h-alt"></i></div>

</div>

<div class="search-action">    
    <button type="button" class="reset-button si-button" data-ng-show="filter.hasFilters()" data-ng-click="resetFilters()" title="<?php _e('Reset', SI) ?>"><i class="fal fa-undo"></i></button>
    <button type="button" class="trigger-button si-button" data-ng-show="result_url != null" data-ng-click="showResultPage()" title="<?php _e('Search', SI) ?>"><i class="fal fa-search"></i></button>
        

    <div class="filter-menu">
        <div class="si-dropdown" data-show-button-icon="false">
            <div class="dropdown-button si-element {{filter.hasFilters() ? 'active' : ''}}"> <span class="label"><?php _e("Filters",SI) ?></span> <i class="fal fa-filter"><b ng-if="filter.hasFilters()">{{filter.count()}}</b></i></div>
            <div class="si-dropdown-panel">
                <div class="dropdown-item {{filter.hasFilter('letters') ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'letters')"><?php _e('Letter', SI) ?></div>
                <div class="dropdown-item {{filter.hasFilter('licenses') ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'licenses')"><?php _e('Licenses', SI) ?></div>
                <div class="dropdown-item {{filter.hasFilter('offices') ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'offices')"><?php _e('Offices', SI) ?></div>
            </div>
        </div>
    </div>
</div>


<!-- LETTERS -->
<?php
SourceImmo::view("list/brokers/search/panels/letters");
?>


<!-- LICENSES -->
<?php
SourceImmo::view("list/brokers/search/panels/licenses");
?>


<!-- OFFICES -->
<?php
SourceImmo::view("list/brokers/search/panels/offices");
?>

<!-- OTHER -->
<?php
SourceImmo::view("list/brokers/search/panels/other");