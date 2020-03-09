<div class="filter-panel others-panel {{isExpanded('others')}}">
        <div class="panel-header">
            <h4><?php _e('More', SI) ?></h4>
            <button class="button" type="button"  ng-click="toggleExpand($event,'others')"><i class="fal fa-times"></i></button>
        </div>
        
        <div class="filter-panel-content">
            <div class="transaction filter-row">
                <h4><?php _e('Transaction type',SI) ?></h4>

                <si-input-container>
                    <label><?php _e('Transaction type',SI) ?></label>
                    <si-select si-model="data.transaction_type" si-change="setFilterFromList(listing_states,data.transaction_type)">
                        <si-option value=""><?php _e('Any',SI) ?></si-option>
                        <si-option ng-repeat="item in listing_states" value="{{item.key}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>
            </div>

            <div class="age filter-row">
                <h4><?php _e('Online since',SI) ?></h4>

                <si-input-container>
                    <label><?php _e('Online since',SI) ?></label>
                    <si-select si-model="data.contract" si-change="setFilterFromList(listing_ages,data.contract)">
                        <si-option value=""><?php _e('Any',SI) ?></si-option>
                        <si-option ng-repeat="item in listing_ages" value="{{item.key}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>

            </div>

            <div class="parkings filter-row">
                <h4><?php _e('Parkings',SI) ?></h4>

                <si-input-container>
                    <label><?php _e('Parkings',SI) ?></label>
                    <si-select si-model="data.parkings" si-change="setFilterFromList(parkingSuggestions,data.parkings)">
                        <si-option value=""><?php _e('Any',SI) ?></si-option>
                        <si-option ng-repeat="item in parkingSuggestions" value="{{item.value}}">{{item.label}}</si-option>
                    </si-select>
                </si-input-container>


            </div>

            <div class="lang-area filter-row" ng-if="!isMainFiltered(['commercial'])">
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

            <div class="building-area filter-row" ng-if="!isMainFiltered(['commercial'])">
                <h4><?php _e('Available area',SI) ?></h4>
                <div class="si-min-max-input-container">
                    <span><?php _e('Between',SI) ?></span>
                    <div class="si-dropdown" data-has-value="{{filter.data.available_min != null}}">
                        <div class="dropdown-button" >{{filter.getFilterCaptionFromList({data: 'available_min'},available_areas, '<?php _e('Min',SI) ?>')}}</div>
                        <div class="si-dropdown-panel">
                            <div class="dropdown-item
                                    {{filter.data.available_min == null ? 'active' : ''}}"
                                data-ng-click="setArea(null, 'available', 'min', '')">
                                <?php _e('Min',SI) ?>
                            </div>
                            <div class="dropdown-item
                                    {{filter.data.available_min == item.value ? 'active' : ''}}"
                                data-ng-repeat="item in available_areas"
                                data-ng-click="setArea(item.value, 'available', 'min', 'Avail. area more than {0} sqft')">
                                {{item.caption}}
                            </div>
                        </div>
                    </div>
                    <span><?php _e('and',SI) ?></span>
                    <div class="si-dropdown" data-has-value="{{filter.data.available_max != null}}">
                        <div class="dropdown-button" >{{filter.getFilterCaptionFromList({data: 'available_max'},available_areas, '<?php _e('Max',SI) ?>')}}</div>
                        <div class="si-dropdown-panel">
                            <div class="dropdown-item
                                    {{filter.data.available_max == null ? 'active' : ''}}"
                                data-ng-click="setArea(null, 'available', 'max', '')">
                                <?php _e('Max',SI) ?>
                            </div>
                            <div class="dropdown-item
                                    {{filter.data.available_max == item.value ? 'active' : ''}}"
                                data-ng-repeat="item in available_areas"
                                data-ng-click="setArea(item.value, 'available', 'max', 'Avail. area less than {0} sqft')">
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
                        data-ng-repeat="(key,item) in listing_flags"
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