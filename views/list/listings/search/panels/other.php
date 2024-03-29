<?php
$panelKey = 'others';
?>
<div class="filter-panel others-panel {{isExpanded('<?php echo($panelKey) ?>')}}">
    <div class="filter-panel-header">
        <div  class="si-panel-header-title"><?php si_label('More') ?></div>
        <button class="si-button" type="button"  ng-click="toggleExpand($event,'<?php echo($panelKey) ?>')"><i class="fal fa-times"></i></button>
    </div>
    
    <div class="filter-panel-content">
        <div class="si-auto-columns">
            <div class="bedrooms filter-row" ng-if="allowPanel('rooms')">
                <si-input-container>
                    <label><?php si_label('Bedrooms') ?></label>

                    <si-select class="si-input" si-model="filter.data.bedrooms" si-change="filter.update()">
                        <si-option value=""><?php si_label('Any') ?></si-option>
                        <si-option ng-repeat="item in bedroomSuggestions" value="{{item.value}}">{{item.label}}</si-option>
                    </si-select>

                </si-input-container>
                
            </div>

            <div class="bathrooms filter-row" ng-if="allowPanel('rooms')">
                <si-input-container>
                    <label><?php si_label('Bathrooms') ?></label>

                    <si-select class="si-input" si-model="filter.data.bathrooms" si-change="filter.update()">
                        <si-option value=""><?php si_label('Any') ?></si-option>
                        <si-option ng-repeat="item in bathroomSuggestions" value="{{item.value}}">{{item.label}}</si-option>
                    </si-select>

                </si-input-container>
                
            </div>

            <div class="parkings filter-row" ng-if="parkingSuggestions">
                <si-input-container>
                    <label><?php si_label('Parkings') ?></label>
                    <si-select class="si-input" si-model="filter.data.parkings" si-change="filter.update()">
                        <si-option value=""><?php si_label('Any') ?></si-option>
                        <si-option ng-repeat="item in parkingSuggestions" value="{{item.value}}">{{item.label}}</si-option>
                    </si-select>
                </si-input-container>
            </div>

        </div>

        <div class="si-auto-columns">
            <div class="transaction filter-row" ng-if="listing_states">
                <si-input-container>
                    <label><?php si_label('Transaction type') ?></label>
                    <si-select class="si-input" si-model="filter.data.transaction_type" si-change="filter.update()">
                        <si-option value=""><?php si_label('Any') ?></si-option>
                        <si-option ng-repeat="item in listing_states" value="{{item.key}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>
            </div>

            
            <div class="market-type filter-row"  ng-if="allowPanel('market')">
                <si-input-container>
                    <label><?php si_label('Market') ?></label>
                    <si-select class="si-input" si-model="filter.data.market_type" si-change="filter.update()">
                        <si-option value=""><?php si_label('Any') ?></si-option>
                        <si-option ng-repeat="item in market_types" value="{{item.key}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>
            </div>

            <div class="age filter-row" ng-if="listing_ages">
                <si-input-container>
                    <label><?php si_label('Online since') ?></label>
                    <si-select class="si-input" si-model="filter.data.contract" si-change="filter.update()">
                        <si-option value=""><?php si_label('Any') ?></si-option>
                        <si-option ng-repeat="item in listing_ages" value="{{item.key}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>

            </div>
            
        </div>

        <div class="area-filters" ng-if="!allowPanel('areas')">

            <div class="land-area filter-row" >
                <si-input-container class="si-float-label si-input-group">
                    <label><?php si_label('Land area') ?></label>
                    
                    <span><?php si_label('Between') ?></span>
                    <si-select si-model="filter.data.land_min" si-change="filter.update()" placeholder="Min">
                        <si-option value=""><?php si_label('Any') ?></si-option>
                        <si-option ng-repeat="item in land_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>

                    <span><?php si_label('and') ?></span>
                    <si-select si-model="filter.data.land_max"  si-change="filter.update()" placeholder="Max">
                        <si-option value=""><?php si_label('Any') ?></si-option>
                        <si-option ng-repeat="item in land_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>
                
            </div>

            <div class="building-area filter-row">
                <si-input-container class="si-float-label si-input-group">
                    <label><?php si_label('Available area') ?></label>
                    
                    <span><?php si_label('Between') ?></span>
                    <si-select si-model="filter.data.available_min" si-change="filter.update()" placeholder="Min">
                        <si-option value=""><?php si_label('Any') ?></si-option>
                        <si-option ng-repeat="item in available_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>

                    <span><?php si_label('and') ?></span>
                    <si-select si-model="filter.data.available_max"  si-change="filter.update()" placeholder="Max">
                        <si-option value=""><?php si_label('Any') ?></si-option>
                        <si-option ng-repeat="item in available_areas" value="{{item.value}}">{{item.caption}}</si-option>
                    </si-select>
                </si-input-container>
            </div>
        </div>

        
        <div class="attribute filter-row">
            <si-input-container class="si-float-label">
                <label>
                    <?php si_label('Features') ?>
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
                <label><?php si_label('Filters') ?></label>
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