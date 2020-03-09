
    <div class="filter-panel categories-panel {{isExpanded('categories')}} ">
        <div class="panel-header">
            <h4><?php _e('Home types', SI) ?></h4>
            <button class="button" type="button"  ng-click="toggleExpand($event,'categories')"><i class="fal fa-times"></i></button>
        </div>
        
        <div class="filter-panel-content">
            <div class="panel-list">
                <div class="list-container">
                    <div class="list-item category {{category.selected || filter.sublistHasFilters(category_code, dictionary.listing_subcategory) ? 'has-filters' : ''}}" 
                        data-ng-repeat="(category_code,category) in dictionary.listing_category">
                        <div class="list-item-title category-name"
                            data-ng-click="expandSublist(dictionary.listing_category, category,category_code)">
                            <h5><i class="far fa-fw fa-{{getCategoryIcon(category_code)}}"></i> {{category.caption}}</h5>
                        </div>

                        <div class="sublist category-subcategories {{category.expanded ? 'expanded' : ''}}"
                            style="--item-count:{{(subcategory_list | filter : {parent: category_code}).length}}">
                            <div class="sublist-container subcategory-container">
                                <si-checkbox
                                    class="sublist-all"
                                    data-ng-click="filter.addFilter('category_code','in',getSelection(dictionary.listing_category))"
                                    data-ng-model="category.selected"
                                    data-label="<?php _e('All', SI) ?> {{category.caption.toLowerCase()}}"
                                    ></si-checkbox>
                                    
                                <si-checkbox
                                    data-ng-repeat="item in subcategory_list | filter: {parent: category_code} | orderBy: 'caption'"
                                    data-ng-click="filter.addFilter('subcategory_code','in',getSelection(dictionary.listing_subcategory))"
                                    ng-disabled="category.selected"
                                    data-ng-model="dictionary.listing_subcategory[item.__$obj_key].selected"
                                    data-label="{{item.caption}}"
                                    ></si-checkbox>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="building-category filter-row">
                <h4><?php _e('Building types',SI) ?></h4>
                
                <div class="grid-layout-column">
                    <si-checkbox
                        data-ng-repeat="(key,item) in dictionary.building_category"
                        data-ng-click="filter.addFilter('building.category_code','in',filter.getSelection(dictionary.building_category))"
                        data-ng-model="item.selected"
                        data-label="{{item.caption.translate()}}"
                        ></si-checkbox>
                </div>
            </div>
        </div>
    </div>