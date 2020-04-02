
    <div class="filter-panel cities-panel {{isExpanded('cities')}}">
        <div class="panel-header">
            <h4><?php _e('Cities', SI) ?></h4>
            <button class="button" type="button"  ng-click="toggleExpand($event,'cities')"><i class="fal fa-times"></i></button>
        </div>
        
        <div class="filter-panel-content">
            
            <div class="panel-list region-city-list">                 
                <div class="list-container regions">
                    <div class="list-item region {{region.selected || filter.sublistHasFilters(region.__$obj_key, city_list) ? 'has-filters' : ''}}" 
                        data-ng-repeat="region in region_list | orderObjectBy: 'caption'" 
                        >

                        <div class="list-item-title region-name {{region.expanded ? 'expanded' : ''}}">
                            <si-checkbox 
                                data-ng-model="filter.data.regions"
                                data-si-change="filter.update()"
                                data-si-value="{{region.__$obj_key}}"
                                ></si-checkbox> 
                            <h5 data-ng-click="expandSublist(region_list,region)"
                                data-ng-click-off="changeRegionTab(region.__$obj_key)"><span>{{region.caption}}</span> <i class="fal fa-plus"></i></h5>                                
                        </div>

                        <div class="sublist region-cities {{region.expanded ? 'expanded' : ''}}" 
                            style="--item-count:{{(city_list | filter : {parent: region.__$obj_key}).length}}">

                            <div class="sublist-container city-container">
                                <si-checkbox
                                    data-ng-repeat="city in city_list | filter : {parent: region.__$obj_key} | orderBy: 'caption'"
                                    data-ng-model="filter.data.cities"
                                    data-si-change="filter.update()"
                                    data-si-value="{{city.__$obj_key}}"
                                    ng-disabled="filter.data.regions.includes(region.__$obj_key)"
                                    data-label="{{city.caption.replace('(' + region.caption +')','')}}"
                                    ></si-checkbox>
                            </div>
                        </div>

                    </div>
                </div>


            </div>
        </div>
    </div>