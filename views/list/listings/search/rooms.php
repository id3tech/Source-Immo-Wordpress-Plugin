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