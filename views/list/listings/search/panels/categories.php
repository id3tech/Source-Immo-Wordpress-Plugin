
    <div class="filter-panel categories-panel {{isExpanded('categories')}} ">
        <div class="panel-header">
            <h4><?php _e('Types', SI) ?></h4>
            <button class="button" type="button"  ng-click="toggleExpand($event,'categories')"><i class="fal fa-times"></i></button>
        </div>
        
        <div class="filter-panel-content" >
            <div class="building-category panel-list" ng-if="!isMainFiltered(['commercial'])">
                <h4><?php _e('Building types',SI) ?></h4>
                
                <div class="list-container">
                    <si-checkbox
                        data-ng-repeat="(key,item) in dictionary.building_category"
                        data-ng-click="filter.addFilter('building.category_code','in',filter.getSelection(dictionary.building_category))"
                        data-ng-model="item.selected"
                        data-label="{{item.caption.translate()}}"
                        ></si-checkbox>
                </div>
            </div>

            <div class="listing-subcategory panel-list">
                <h4><?php _e('Home types',SI) ?></h4>
                <div class="list-container">
                    <si-checkbox
                        data-ng-repeat="item in subcategory_list | filter: mainSubCategoryMatchFilter | orderBy: 'caption'"
                        data-ng-click="filter.addFilter('subcategory_code','in',getSelection(dictionary.listing_subcategory))"
                        ng-disabled="category.selected"
                        data-ng-model="dictionary.listing_subcategory[item.__$obj_key].selected"
                        data-label="{{item.caption}}"
                                ></si-checkbox>
                </div>
            </div>

            
        </div>
    </div>