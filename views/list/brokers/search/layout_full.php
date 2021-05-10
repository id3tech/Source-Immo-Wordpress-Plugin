<div class="main-filter-tabs si-tab-count-{{configs.search_engine_options.tabs.length}}"
        ng-if="configs.search_engine_options.tabbed">
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

<div class="inputs {{(!isFieldFiltered('searchbox')) ? 'no-searchbox' : ''}}" style="--input-count: {{getInputCount()}}">
    <div class="search-box" ng-if="isFieldFiltered('searchbox')" >
        <si-search-box
            alias="<?php echo $configs->alias ?>" 
            placeholder="<?php echo(apply_filters('si_label', __('Search by first or last name',SI))) ?>"></si-search-box>

    </div>

    <div class="si-panel-button si-hover-shade letters {{isExpanded('letters')}} {{filter.hasFilter('letters') ? 'has-filters' : ''}}"  
        ng-click="toggleExpand($event,'letters')"
        ng-if="isFieldFiltered('letters')"><span><?php echo(apply_filters('si_label', __('Letter', SI))) ?></span> <i class="fal fa-angle-down"></i></div>
    <div class="si-panel-button si-hover-shade offices {{isExpanded('offices')}} {{filter.hasFilter('offices') ? 'has-filters' : ''}}" 
        ng-show="officeList.length > 1"
        ng-if="isFieldFiltered('offices')"
         ng-click="toggleExpand($event,'offices')"><span><?php echo(apply_filters('si_label', __('Offices', SI))) ?></span> <i class="fal fa-angle-down"></i></div>

    <div class="si-panel-button si-hover-shade more-button {{isExpanded('others')}} 
        {{ filter.hasFilter(getOtherPanelFilterList()) ? 'has-filters' : '' }}"
        ng-click="toggleExpand($event,'others')"><i class="fal fa-ellipsis-h-alt"></i></div>

</div>

<div class="search-action">    
    <button type="button" class="reset-button si-button" data-ng-show="filter.hasFilters()" data-ng-click="resetFilters()" title="<?php echo(apply_filters('si_label', __('Reset', SI))) ?>"><i class="fal fa-undo"></i></button>
    <button type="button" class="trigger-button si-button" data-ng-show="result_url != null" data-ng-click="showResultPage()" title="<?php echo(apply_filters('si_label', __('Search', SI))) ?>"><i class="fal fa-search"></i></button>
        

    <div class="filter-menu">
        <div class="si-dropdown" data-show-button-icon="false">
            <div class="si-dropdown-button si-element {{filter.hasFilters() ? 'active' : ''}}"> <span class="label"><?php echo(apply_filters('si_label', __("Filters",SI))) ?></span> <i class="fal fa-filter"><b ng-if="filter.hasFilters()">{{filter.count()}}</b></i></div>
            <div class="si-dropdown-panel">
                <div class="si-dropdown-item {{filter.hasFilter('letters') ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'letters')"><?php echo(apply_filters('si_label', __('Letter', SI))) ?></div>
                <div class="si-dropdown-item {{filter.hasFilter('licenses') ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'licenses')"><?php echo(apply_filters('si_label', __('Licenses', SI))) ?></div>
                <div class="si-dropdown-item {{filter.hasFilter('offices') ? 'has-filters' : ''}}" ng-click="toggleExpand($event,'offices')"><?php echo(apply_filters('si_label', __('Offices', SI))) ?></div>
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