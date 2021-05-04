<?php
$panelKey = 'categories';
?>

    <div class="filter-panel categories-panel {{isExpanded('<?php echo($panelKey) ?>')}} ">
        <div class="filter-panel-header">
            <h4><?php echo(apply_filters('si_label', __('Types', SI))) ?></h4>
            <button class="button" type="button"  ng-click="toggleExpand($event,'<?php echo($panelKey) ?>')"><i class="fal fa-times"></i></button>
        </div>
        
        <div class="filter-panel-content" >


            <div class="listing-subcategory panel-list">
                <h4><?php echo(apply_filters('si_label', __('Home types',SI))) ?></h4>
                
                <div class="list-container subcategories" ng-if="subcategory_list.length <= 15">
                    <si-checkbox
                        data-ng-repeat="item in subcategory_list | orderBy: 'parent'"
                        data-si-value="{{item.__$key}}"
                        data-ng-model="filter.data.subcategories"
                        si-change="filter.update()"
                        data-label="{{item.caption}}"
                                ></si-checkbox>
                </div>

                <div class="list-container categories" ng-if="subcategory_list.length > 15">
                    <div class="list-item category {{filter.sublistHasFilters(category.__$obj_key, subcategory_list, filter.data.categories) ? 'has-filters' : ''}}" 
                        data-ng-repeat="category in category_list | orderObjectBy: 'caption'" 
                        >

                        <div class="list-item-title category-name {{category.expanded ? 'expanded' : ''}}">
                            <si-checkbox 
                                data-ng-model="filter.data.categories"
                                data-si-change="filter.update()"
                                data-si-value="{{category.__$obj_key}}"
                                ></si-checkbox> 
                            <h5 data-ng-click="expandSublist(category_list,category)"
                                data-ng-click-off="changeRegionTab(category.__$obj_key)"><span>{{category.caption}}</span> <i class="fal fa-plus"></i></h5>                                
                        </div>

                        <div class="sublist category-subcategories {{category.expanded ? 'expanded' : ''}}" 
                            style="--item-count:{{(subcategory_list | filter : {parent: category.__$obj_key}).length}}">

                            <div class="sublist-container subcategory-container">
                                <si-checkbox
                                    data-ng-repeat="item in subcategory_list | filter: {parent: category.__$obj_key} | orderBy: 'caption'"
                                    data-si-value="{{item.__$key}}"
                                    data-ng-model="filter.data.subcategories"
                                    si-change="filter.update()"
                                    data-label="{{item.caption}}"
                                            ></si-checkbox>
                            </div>  
                        </div>
                    </div>
                </div>
            </div>

            <div class="building-category panel-list" ng-show="dictionary.building_category!=undefined" ng-if="!isMainFiltered(['commercial'])">
                <h4><?php echo(apply_filters('si_label', __('Building types',SI))) ?></h4>
                
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
        </div>

        <div class="filter-panel-actions">
        <?php include '_actions.php'; ?>
        </div>
    </div>