<div class="filter-panel others-panel {{isExpanded('others')}}">
        <div class="panel-header">
            <h4><?php _e('More', SI) ?></h4>
            <button class="button" type="button"  ng-click="toggleExpand($event,'others')"><i class="fal fa-times"></i></button>
        </div>
        
        <div class="filter-panel-content">
            
            <div class="age filter-row">
                <h4><?php _e('Online since',SI) ?></h4>
                <div class="si-dropdown" data-has-value="{{filter.getFilterValue('contract.start_date')}}">
                    <div class="dropdown-button">{{filter.getFilterCaptionFromList('contract.start_date',listing_ages,listing_ages[0].caption)}}</div>
                    <div class="si-dropdown-panel">
                        <div class="dropdown-item
                                {{filter.getFilterValue('contract.start_date') == item.filter.value ? 'active' : ''}}"
                            data-ng-click="filter.addFilter(item.filter.field,item.filter.operator,item.filter.value, 'Online since {0}'.translate().format(item.caption))"
                            data-ng-repeat="item in listing_ages">
                            {{item.caption}}
                        </div>
                    </div>
                </div>
            </div>

            <div class="parkings filter-row">
                <h4><?php _e('Parkings',SI) ?></h4>
                <div class="si-dropdown" data-has-value="{{filter.getFilterValue('attributes.PARKING')}}">
                    <div class="dropdown-button" >{{filter.getFilterCaptionFromList('attributes.PARKING',parkingSuggestions, '<?php _e('Any',SI) ?>')}}</div>
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

            <div class="lang-area filter-row">
                <h4><?php _e('Land area',SI) ?></h4>
                <div class="si-min-max-input-container">
                    <span><?php _e('Between',SI) ?></span>
                    <div class="si-dropdown" data-has-value="{{filter.data.land_min != null}}">
                        <div class="dropdown-button" >{{filter.getFilterCaptionFromList({data: 'land_min'},land_areas, '<?php _e('Min',SI) ?>')}}</div>
                        <div class="si-dropdown-panel">
                            <div class="dropdown-item
                                    {{filter.data.land_min == null ? 'active' : ''}}"
                                data-ng-click="setArea(null, 'land', 'min', '')">
                                <?php _e('Min',SI) ?>
                            </div>
                            <div class="dropdown-item
                                    {{filter.data.land_min == item.value ? 'active' : ''}}"
                                data-ng-repeat="item in land_areas"
                                data-ng-click="setArea(item.value, 'land', 'min', 'Land more than {0} sqft')">
                                {{item.caption}}
                            </div>
                        </div>
                    </div>
                    <span><?php _e('and',SI) ?></span>
                    <div class="si-dropdown" data-has-value="{{filter.data.land_max != null}}">
                        <div class="dropdown-button" >{{filter.getFilterCaptionFromList({data: 'land_max'},land_areas, '<?php _e('Max',SI) ?>')}}</div>
                        <div class="si-dropdown-panel">
                            <div class="dropdown-item
                                    {{filter.data.land_max == null ? 'active' : ''}}"
                                data-ng-click="setArea(null, 'land', 'max', '')">
                                <?php _e('Max',SI) ?>
                            </div>
                            <div class="dropdown-item
                                    {{filter.data.land_max == item.value ? 'active' : ''}}"
                                data-ng-repeat="item in land_areas"
                                data-ng-click="setArea(item.value, 'land', 'max', 'Land less than {0} sqft')">
                                {{item.caption}}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div class="building-area filter-row">
                <h4><?php _e('Available area',SI) ?></h4>
                <div class="si-min-max-input-container">
                    <span><?php _e('Between',SI) ?></span>
                    <div class="si-dropdown" data-has-value="{{filter.data.building_min != null}}">
                        <div class="dropdown-button" >{{filter.getFilterCaptionFromList({data: 'building_min'},building_areas, '<?php _e('Min',SI) ?>')}}</div>
                        <div class="si-dropdown-panel">
                            <div class="dropdown-item
                                    {{filter.data.building_min == null ? 'active' : ''}}"
                                data-ng-click="setArea(null, 'building', 'min', '')">
                                <?php _e('Min',SI) ?>
                            </div>
                            <div class="dropdown-item
                                    {{filter.data.building_min == item.value ? 'active' : ''}}"
                                data-ng-repeat="item in building_areas"
                                data-ng-click="setArea(item.value, 'building', 'min', 'Building more than {0} sqft')">
                                {{item.caption}}
                            </div>
                        </div>
                    </div>
                    <span><?php _e('and',SI) ?></span>
                    <div class="si-dropdown" data-has-value="{{filter.data.building_max != null}}">
                        <div class="dropdown-button" >{{filter.getFilterCaptionFromList({data: 'building_max'},building_areas, '<?php _e('Max',SI) ?>')}}</div>
                        <div class="si-dropdown-panel">
                            <div class="dropdown-item
                                    {{filter.data.building_max == null ? 'active' : ''}}"
                                data-ng-click="setArea(null, 'building', 'max', '')">
                                <?php _e('Max',SI) ?>
                            </div>
                            <div class="dropdown-item
                                    {{filter.data.building_max == item.value ? 'active' : ''}}"
                                data-ng-repeat="item in building_areas"
                                data-ng-click="setArea(item.value, 'building', 'max', 'Building less than {0} sqft')">
                                {{item.caption}}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            <div class="attribute filter-row">
                <h4><?php _e('Caracteristics',SI) ?></h4>
                <div class="grid-layout-column">
                    <si-checkbox
                        data-ng-repeat="(key,item) in listing_attributes"
                        data-ng-click="filter.addAttributeFilter(item)"
                        data-ng-model="item.selected"
                        data-label="{{item.caption.translate()}}"
                        ></si-checkbox>
                </div>
            </div>

            <div class="transaction filter-row">
                <h4><?php _e('Filters',SI) ?></h4>
                <div class="grid-layout-column">
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
    </div>