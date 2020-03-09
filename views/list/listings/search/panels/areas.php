<div class="filter-panel areas-panel {{isExpanded('areas')}}">
    <div class="panel-header">
        <h4><?php _e('Areas', SI) ?></h4>
        <button class="button" type="button"  ng-click="toggleExpand($event,'areas')"><i class="fal fa-times"></i></button>
    </div>

    <div class="filter-panel-content">
        
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
</div>