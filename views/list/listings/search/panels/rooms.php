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
                        data-ng-model="filter.data.bedrooms"
                        data-si-value="{{item.value}}"
                        si-change="filter.update()"
                        data-label="{{item.label}}"
                    ></si-radio>

                <si-radio
                        name="bedrooms-count"
                        data-ng-model="filter.data.bedrooms"
                        data-si-value=""
                        si-change="filter.update()"
                        data-label="<?php _e('Any',SI) ?>"
                    ></si-radio>
                
            </div>

            <div class="bathrooms">
                <h4><?php _e('Bathrooms',SI) ?></h4>
                
                <si-radio
                        data-ng-repeat="item in bathroomSuggestions"
                        name="bathrooms-count"
                        data-ng-model="filter.data.bathrooms"
                        data-si-value="{{item.value}}"
                        si-change="filter.update()"
                        data-label="{{item.label}}"
                    ></si-radio>

                <si-radio
                        name="bathrooms-count"
                        data-ng-model="filter.data.bathrooms"
                        data-si-value=""
                        si-change="filter.update()"
                        data-label="<?php _e('Any',SI) ?>"
                    ></si-radio>

            </div>
        </div>
    </div>