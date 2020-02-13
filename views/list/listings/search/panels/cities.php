
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

                        <div class="list-item-title region-name " 
                                data-ng-click="expandSublist(region_list,region)"
                                data-ng-click-off="changeRegionTab(region.__$obj_key)">
                            <h5>{{region.caption}}</h5>                                
                        </div>

                        <div class="sublist region-cities {{region.expanded ? 'expanded' : ''}}" 
                            style="--item-count:{{(city_list | filter : {parent: region.__$obj_key}).length}}">

                            <div class="sublist-container city-container">
                                <si-checkbox class="sublist-all"
                                    data-label="{{'All cities'.translate()}}" 
                                    data-ng-model="region.selected"
                                    data-ng-click="filter.addFilter('location.region_code','in',getSelection(region_list))"></si-checkbox>

                                <si-checkbox
                                    data-ng-repeat="city in city_list | filter : {parent: region.__$obj_key} | orderBy: 'caption'"
                                    data-ng-click="filter.addFilter('location.city_code','in',getSelection(city_list))"
                                    data-ng-model="city.selected"
                                    ng-disabled="region.selected"
                                    data-label="{{city.caption.replace('(' + region.caption +')','')}}"
                                    ></si-checkbox>
                            </div>
                        </div>

                    </div>
                </div>


            </div>
        </div>
    </div>