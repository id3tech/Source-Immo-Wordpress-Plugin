<?php
$panelKey = 'others';
?>
<div class="filter-panel others-panel {{isExpanded('<?php echo($panelKey) ?>')}}">
    <div class="filter-panel-header">
        <h4><?php _e('More', SI) ?></h4>
        <button class="button" type="button"  ng-click="toggleExpand($event,'<?php echo($panelKey) ?>')"><i class="fal fa-times"></i></button>
    </div>
    
    <div class="filter-panel-content">
        <div class="transaction filter-row" ng-if="!isMainFiltered(['for-sale','for-rent'])">
            <si-input-container>
                <label><?php _e('Transaction type',SI) ?></label>
                <si-select si-model="filter.data.transaction_type" si-change="filter.update()">
                    <si-option value=""><?php _e('Any',SI) ?></si-option>
                    <si-option ng-repeat="item in listing_states" value="{{item.key}}">{{item.caption}}</si-option>
                </si-select>
            </si-input-container>
        </div>

        <div class="age filter-row">
            <si-input-container>
                <label><?php _e('Online since',SI) ?></label>
                <si-select si-model="filter.data.contract" si-change="filter.update()">
                    <si-option value=""><?php _e('Any',SI) ?></si-option>
                    <si-option ng-repeat="item in listing_ages" value="{{item.key}}">{{item.caption}}</si-option>
                </si-select>
            </si-input-container>

        </div>

        <div class="parkings filter-row">
            <si-input-container>
                <label><?php _e('Parkings',SI) ?></label>
                <si-select si-model="filter.data.parkings" si-change="filter.update()">
                    <si-option value=""><?php _e('Any',SI) ?></si-option>
                    <si-option ng-repeat="item in parkingSuggestions" value="{{item.value}}">{{item.label}}</si-option>
                </si-select>
            </si-input-container>


        </div>

        <div class="area-filters">

            <div class="land-area filter-row" ng-if="!isMainFiltered(['COM'])">
                <si-input-container class="si-float-label si-input-group">
                    <label><?php _e('Land area',SI) ?></label>
                    
                    <span><?php _e('Between',SI) ?></span>
                    <si-select si-model="filter.data.land_min" si-change="filter.update()" placeholder="Min">
                        <si-option value=""><?php _e('Any',SI) ?></si-option>
                        <si-option ng-repeat="item in land_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>

                    <span><?php _e('and',SI) ?></span>
                    <si-select si-model="filter.data.land_max"  si-change="filter.update()" placeholder="Max">
                        <si-option value=""><?php _e('Any',SI) ?></si-option>
                        <si-option ng-repeat="item in land_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>
                
            </div>

            <div class="building-area filter-row" ng-if="!isMainFiltered(['COM'])">
                <si-input-container class="si-float-label si-input-group">
                    <label><?php _e('Available area',SI) ?></label>
                    
                    <span><?php _e('Between',SI) ?></span>
                    <si-select si-model="filter.data.available_min" si-change="filter.update()" placeholder="Min">
                        <si-option value=""><?php _e('Any',SI) ?></si-option>
                        <si-option ng-repeat="item in available_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>

                    <span><?php _e('and',SI) ?></span>
                    <si-select si-model="filter.data.available_max"  si-change="filter.update()" placeholder="Max">
                        <si-option value=""><?php _e('Any',SI) ?></si-option>
                        <si-option ng-repeat="item in available_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>
            </div>
        </div>

        
        <div class="attribute filter-row">
            <si-input-container class="si-float-label">
                <label>
                    <?php _e('Caracteristics',SI) ?>
                </label>
                <div class="grid-layout-column">
                    <si-checkbox
                        data-ng-repeat="(key,item) in listing_attributes"
                        ng-model="filter.data.attributes"
                        si-value="{{item.field}}"
                        si-change="filter.update()"
                        data-label="{{item.caption.translate()}}"
                        ></si-checkbox>
                </div>
            </si-input-container>
        </div>

        <div class="filters filter-row">
            <si-input-container class="si-float-label">
                <label><?php _e('Filters',SI) ?></label>
                <div class="grid-layout-column">
                    <si-checkbox
                        data-ng-repeat="(key,item) in listing_flags"
                        ng-model="filter.data.states"
                        si-value="{{key}}"
                        si-change="filter.update()"
                        data-label="{{item.caption.translate()}}"
                        ></si-checkbox>
                    <si-checkbox
                        data-ng-show="hasFavorites()"
                        ng-model="filter.data.favorites"
                        si-value="{{getFavorites('ref_number').join(',')}}"
                        si-change="filter.update()"
                        data-label="{{'My favorites'.translate()}}"
                        ></si-checkbox>
                </div>
            </si-input-container>
        </div>
    </div>

    <div class="filter-panel-actions">
        <?php include '_actions.php'; ?>
    </div>
</div>