<?php
$panelKey = 'others';
?>
<div class="filter-panel others-panel {{isExpanded('<?php echo($panelKey) ?>')}}">
    <div class="filter-panel-header">
        <h4><?php echo(apply_filters('si_label', __('More', SI))) ?></h4>
        <button class="button" type="button"  ng-click="toggleExpand($event,'<?php echo($panelKey) ?>')"><i class="fal fa-times"></i></button>
    </div>
    
    <div class="filter-panel-content">
        <div class="si-auto-columns">
            <div class="bedrooms filter-row" ng-if="allowPanel('rooms')">
                <si-input-container>
                    <label><?php echo(apply_filters('si_label', __('Bedrooms',SI))) ?></label>

                    <si-select class="si-input" si-model="filter.data.bedrooms" si-change="filter.update()">
                        <si-option value=""><?php echo(apply_filters('si_label', __('Any',SI))) ?></si-option>
                        <si-option ng-repeat="item in bedroomSuggestions" value="{{item.value}}">{{item.label}}</si-option>
                    </si-select>

                </si-input-container>
                
            </div>

            <div class="bathrooms filter-row" ng-if="allowPanel('rooms')">
                <si-input-container>
                    <label><?php echo(apply_filters('si_label', __('Bathrooms',SI))) ?></label>

                    <si-select class="si-input" si-model="filter.data.bathrooms" si-change="filter.update()">
                        <si-option value=""><?php echo(apply_filters('si_label', __('Any',SI))) ?></si-option>
                        <si-option ng-repeat="item in bathroomSuggestions" value="{{item.value}}">{{item.label}}</si-option>
                    </si-select>

                </si-input-container>
                
            </div>

            <div class="parkings filter-row" ng-if="parkingSuggestions">
                <si-input-container>
                    <label><?php echo(apply_filters('si_label', __('Parkings',SI))) ?></label>
                    <si-select class="si-input" si-model="filter.data.parkings" si-change="filter.update()">
                        <si-option value=""><?php echo(apply_filters('si_label', __('Any',SI))) ?></si-option>
                        <si-option ng-repeat="item in parkingSuggestions" value="{{item.value}}">{{item.label}}</si-option>
                    </si-select>
                </si-input-container>
            </div>

        </div>

        <div class="si-auto-columns">
            <div class="transaction filter-row" ng-if="listing_states">
                <si-input-container>
                    <label><?php echo(apply_filters('si_label', __('Transaction type',SI))) ?></label>
                    <si-select class="si-input" si-model="filter.data.transaction_type" si-change="filter.update()">
                        <si-option value=""><?php echo(apply_filters('si_label', __('Any',SI))) ?></si-option>
                        <si-option ng-repeat="item in listing_states" value="{{item.key}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>
            </div>

            
            <div class="market-type filter-row"  ng-if="allowPanel('market')">
                <si-input-container>
                    <label><?php echo(apply_filters('si_label', __('Market',SI))) ?></label>
                    <si-select class="si-input" si-model="filter.data.market_type" si-change="filter.update()">
                        <si-option value=""><?php echo(apply_filters('si_label', __('Any',SI))) ?></si-option>
                        <si-option ng-repeat="item in market_types" value="{{item.key}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>
            </div>

            <div class="age filter-row" ng-if="listing_ages">
                <si-input-container>
                    <label><?php echo(apply_filters('si_label', __('Online since',SI))) ?></label>
                    <si-select class="si-input" si-model="filter.data.contract" si-change="filter.update()">
                        <si-option value=""><?php echo(apply_filters('si_label', __('Any',SI))) ?></si-option>
                        <si-option ng-repeat="item in listing_ages" value="{{item.key}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>

            </div>
            
        </div>

        <div class="area-filters" ng-if="!allowPanel('areas')">

            <div class="land-area filter-row" >
                <si-input-container class="si-float-label si-input-group">
                    <label><?php echo(apply_filters('si_label', __('Land area',SI))) ?></label>
                    
                    <span><?php echo(apply_filters('si_label', __('Between',SI))) ?></span>
                    <si-select si-model="filter.data.land_min" si-change="filter.update()" placeholder="Min">
                        <si-option value=""><?php echo(apply_filters('si_label', __('Any',SI))) ?></si-option>
                        <si-option ng-repeat="item in land_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>

                    <span><?php echo(apply_filters('si_label', __('and',SI))) ?></span>
                    <si-select si-model="filter.data.land_max"  si-change="filter.update()" placeholder="Max">
                        <si-option value=""><?php echo(apply_filters('si_label', __('Any',SI))) ?></si-option>
                        <si-option ng-repeat="item in land_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>
                
            </div>

            <div class="building-area filter-row">
                <si-input-container class="si-float-label si-input-group">
                    <label><?php echo(apply_filters('si_label', __('Available area',SI))) ?></label>
                    
                    <span><?php echo(apply_filters('si_label', __('Between',SI))) ?></span>
                    <si-select si-model="filter.data.available_min" si-change="filter.update()" placeholder="Min">
                        <si-option value=""><?php echo(apply_filters('si_label', __('Any',SI))) ?></si-option>
                        <si-option ng-repeat="item in available_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>

                    <span><?php echo(apply_filters('si_label', __('and',SI))) ?></span>
                    <si-select si-model="filter.data.available_max"  si-change="filter.update()" placeholder="Max">
                        <si-option value=""><?php echo(apply_filters('si_label', __('Any',SI))) ?></si-option>
                        <si-option ng-repeat="item in available_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>
            </div>
        </div>

        
        <div class="attribute filter-row">
            <si-input-container class="si-float-label">
                <label>
                    <?php echo(apply_filters('si_label', __('Caracteristics',SI))) ?>
                </label>
                <div class="grid-layout-column">
                    <si-checkbox
                        data-ng-repeat="item in listing_attributes"
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
                <label><?php echo(apply_filters('si_label', __('Filters',SI))) ?></label>
                <div class="grid-layout-column">
                    <si-checkbox
                        data-ng-repeat="item in listing_flags"
                        ng-model="filter.data.states"
                        si-value="{{item.key}}"
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