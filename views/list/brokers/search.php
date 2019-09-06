<div class="search-box">
    <i class="fal fa-search"></i>

    <input type="text" placeholder="<?php _e('Search by first or last name',SI) ?>"
        data-ng-model="filter.data.keyword" data-ng-keyup="lateCall(searchForKeyword)">
</div>

<div class="advanced">
    <button class="letters {{isExpanded('letters')}} {{filter.hasFilter('last_name') ? 'has-filters' : ''}}" type="button"  
        ng-click="toggleExpand('letters')"><?php _e('Alphabetical', SI) ?></button>
    <button class="licenses {{isExpanded('licenses')}} {{filter.hasFilter('license_type_code') ? 'has-filters' : ''}}" type="button"  
        ng-show="siDictionary.count('broker_license_type') > 1" ng-click="toggleExpand('licenses')"><?php _e('License', SI) ?></button>
    <button class="offices {{isExpanded('offices')}} {{filter.hasFilter('office_id') ? 'has-filters' : ''}}" type="button" 
        ng-show="officeList.length > 1" ng-click="toggleExpand('offices')"><?php _e('Office', SI) ?></button>

    <div class="search-trigger">
        <button type="button" class="btn" data-ng-click="buildAndGo()"><?php _e('Search', SI) ?></button>
    </div>
</div>

<!-- LETTERS -->
<div class="filter-panel letters-panel {{isExpanded('letters')}}">
    <button class="panel-trigger {{isExpanded('letters')}} {{filter.hasFilter('last_name') ? 'has-filters' : ''}}" type="button"  
            ng-click="toggleExpand('letters')"><?php _e('Alphabetical', SI) ?></button>
    <div class="filter-panel-content">
        <h4 class="title"><?php _e('First letter of the last name',SI) ?></h4>
        <div class="filter-list letter-list">
            <div class="letter {{filter.getFilterValue('last_name') == letter ? 'active' : ''}}" 
                    ng-repeat="letter in alphaList" 
                    ng-click="filter.toggleFilter('last_name','starts_with',letter, 'Starting with &quot;{0}&quot;'.translate().format(letter.toUpperCase()))">
                <span>{{letter.toUpperCase()}}</span>
            </div>
        </div>
    </div>
</div>

<!-- LICENSES -->
<div class="filter-panel licenses-panel {{isExpanded('licenses')}}">
    <button class="panel-trigger {{isExpanded('licenses')}} {{filter.hasFilter('license_type_code') ? 'has-filters' : ''}}" type="button"  
        ng-click="toggleExpand('licenses')"><?php _e('License', SI) ?></button>
    <div class="filter-panel-content">
        <h4 class="title"><?php _e('License type',SI) ?></h4>
        <div class="filter-list license-list">    
            <si-radio
                    data-ng-repeat="(key,item) in dictionary.broker_license_type"
                    name="bedrooms-count"
                    data-ng-click="filter.addFilter('license_type_code','equal',key, item.caption)"
                    data-ng-checked="filter.getFilterValue('license_type_code') == key"
                    data-label="{{item.caption}}"
                ></si-radio>

            <si-radio
                    name="bedrooms-count"
                    data-ng-click="filter.addFilter('license_type_code','equal','')"
                    data-ng-checked="filter.getFilterValue('license_type_code') == null"
                    data-label="<?php _e('Any',SI) ?>"
                ></si-radio>
        </div>
    </div>
</div>

<!-- OFFICES -->
<div class="filter-panel offices-panel {{isExpanded('offices')}}">
    <button class="panel-trigger {{isExpanded('offices')}} {{filter.hasFilter('office_id') ? 'has-filters' : ''}}" type="button"  
            ng-click="toggleExpand('offices')"><?php _e('Office', SI) ?></button>
    <div class="filter-panel-content">
        <h4 class="title"><?php _e('Office',SI) ?></h4>
        <div class="filter-list office-list">
        
            <si-checkbox
                data-ng-repeat="item in officeList | orderBy: 'name'"
                data-ng-click="filter.addFilter('office_id','in',getSelection(officeList))"
                data-ng-model="item.selected"
                data-label="{{item.name}}"
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