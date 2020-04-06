
    <div class="filter-panel categories-panel {{isExpanded('categories')}} ">
        <div class="panel-header">
            <h4><?php _e('Types', SI) ?></h4>
            <button class="button" type="button"  ng-click="toggleExpand($event,'categories')"><i class="fal fa-times"></i></button>
        </div>
        
        <div class="filter-panel-content" >
            <div class="building-category panel-list" ng-show="dictionary.building_category!=undefined" ng-if="!isMainFiltered(['commercial'])">
                <h4><?php _e('Building types',SI) ?></h4>
                
                <div class="list-container">
                    <si-checkbox
                        data-ng-repeat="(key,item) in dictionary.building_category"
                        data-si-value="{{key}}"
                        data-ng-model="filter.data.building_categories"
                        si-change="filter.update()"
                        data-label="{{item.caption.translate()}}"
                        ></si-checkbox>
                </div>
            </div>

            <div class="listing-subcategory panel-list">
                <h4><?php _e('Home types',SI) ?></h4>
                <div class="list-container">
                    <si-checkbox
                        data-ng-repeat="item in subcategory_list | filter: mainSubCategoryMatchFilter | orderBy: 'caption'"
                        data-si-value="{{item.__$key}}"
                        data-ng-model="filter.data.subcategories"
                        si-change="filter.update()"
                        data-label="{{item.caption}}"
                                ></si-checkbox>
                </div>
            </div>

            
        </div>
    </div>