<div class="inputs">
    <!-- SEARCHBOX -->
    <div class="search-box"
            ng-if="configs.search_engine_options.fields.includes('searchbox')">
        <si-search-box 
                alias="<?php echo $configs->alias ?>" 
                placeholder="<?php _e('Search a region, city, street',SI) ?>"></si-search-box>
        
        <i class="geo-btn far fa-crosshairs {{data.location!=null ? 'active' : ''}}" data-ng-show="geolocation_available" data-ng-click="filter.addGeoFilter()"></i>
    </div>

    <!-- TRANSACTIONS -->
    <div class="field-input field-transactions"
            ng-if="configs.search_engine_options.fields.includes('transactions')">
                
        <si-select si-model="filter.data.transaction_type" si-change="filter.update()"
            placeholder="<?php _e('Transaction type',SI) ?>">
            <si-option value=""><?php _e('Any',SI) ?></si-option>
            <si-option ng-repeat="item in listing_states" value="{{item.key}}">{{item.caption}}</si-option>
        </si-select>
        
    </div>



    <!-- CATEGORIES -->
    <div class="field-input field-categories"
            ng-if="configs.search_engine_options.fields.includes('categories')">
                
        <si-select si-model="filter.data.categories" si-change="filter.update()"
            placeholder="<?php _e('Categories',SI) ?>">
            <si-option value=""><?php _e('Any',SI) ?></si-option>
            <si-option ng-repeat="item in category_list" value="{{item.__$key}}">{{item.caption}}</si-option>
        </si-select>
    </div>

    <!-- SUBCATEGORIES -->
    <div class="field-input field-cities"
            ng-if="configs.search_engine_options.fields.includes('cities')">
                
        <si-select si-model="filter.data.subcategories" si-change="filter.update()" si-multiple
            placeholder="<?php _e('Home types',SI) ?>">

            <si-option ng-repeat="item in subcategory_list | orderBy: 'caption'" value="{{item.__$key}}">{{item.caption}}</si-option>
        </si-select>
    </div>
    
    <!-- CITIES -->
    <div class="field-input field-cities"
            ng-if="configs.search_engine_options.fields.includes('cities')">
                
        <si-select si-model="filter.data.cities" si-change="filter.update()" si-multiple
            placeholder="<?php _e('Cities',SI) ?>">

            <si-option-group ng-repeat="region in region_list | orderObjectBy: 'caption'" si-label="{{region.caption}}">
                <si-option ng-repeat="item in city_list | filter: {parent: region.__$obj_key}" value="{{item.__$key}}">{{item.caption}}</si-option>
            </si-option-group>
            
        </si-select>
    </div>

    <!-- PRICES -->
    <div class="field-input field-prices"
            ng-if="configs.search_engine_options.fields.includes('price')">
                
        <si-select 
            si-model="[filter.data.min_price, filter.data.max_price]"
            placeholder="<?php _e('Price',SI) ?>">
            <si-option-panel class="price-option-panel" si-caption-format="filter.getPriceRangeCaption()">
                <div class="price-inputs">
                    <si-price-range-slider 
                        model="priceRange" on-change="updatePrice()" 
                        start-label="Min" 
                        end-label="<?php _e('Unlimited',SI) ?>"></si-price-range-slider>
                    <div class="min">
                        <em><?php _e('Minimal price', SI) ?></em>
                        <h2 class="price-value">{{getMinPriceLabel('<?php _e('Min',SI) ?>')}}</h2>
                    </div>
                    
                    <i class="price-divider fal fa-3x fa-arrows-h"></i>

                    <div class="max">
                        <em><?php _e('Maximal price', SI) ?></em>
                        <h2 class="price-value">{{getMaxPriceLabel('<?php _e('Unlimited',SI) ?>')}}</h2>
                    </div>

                </div>
            </si-option-panel>
        </si-select>
    </div>

    <!-- BEDROOMS -->
    <div class="field-input field-bedrooms"
            ng-if="configs.search_engine_options.fields.includes('bedrooms')">
                
        <si-select si-model="filter.data.bedrooms" si-change="filter.update()"
            placeholder="<?php _e('Bedrooms',SI) ?>">
            <si-option value=""><?php _e('Any',SI) ?></si-option>
            <si-option ng-repeat="item in bedroomSuggestions" value="{{item.value}}">{{item.label}}</si-option>
        </si-select>
    </div>

    <!-- BATHROOMS -->
    <div class="field-input field-bathrooms"
            ng-if="configs.search_engine_options.fields.includes('bathrooms')">
                
        <si-select si-model="filter.data.bathrooms" si-change="filter.update()"
            placeholder="<?php _e('Bathrooms',SI) ?>">
            <si-option value=""><?php _e('Any',SI) ?></si-option>
            <si-option ng-repeat="item in bathroomSuggestions" value="{{item.value}}">{{item.label}}</si-option>
        </si-select>
    </div>

    <!-- FEATURES -->
    <div class="field-input field-features"
            ng-if="configs.search_engine_options.fields.includes('features')">
                
        <si-select si-model="filter.data.attributes" si-change="filter.update()"
            si-multiple
            placeholder="<?php _e('Caracteristics',SI) ?>">
            <si-option data-ng-repeat="(key,item) in listing_attributes" value="{{item.field}}">{{item.caption.translate()}}</si-option>
        </si-select>
    </div>

    <!-- FILTERS -->
    <div class="field-input field-filters"
            ng-if="configs.search_engine_options.fields.includes('filters')">
                
        <si-select si-model="filter.data.states" si-change="filter.update()"
            si-multiple
            placeholder="<?php _e('Filters',SI) ?>">
            <si-option data-ng-repeat="(key,item) in listing_flags" value="{{key}}">{{item.caption.translate()}}</si-option>
        </si-select>
    </div>

    <!-- AGE -->
    <div class="field-input field-bathrooms"
            ng-if="configs.search_engine_options.fields.includes('bathrooms')">
             
        <si-input-container>
            <label><?php _e('Online since', SI) ?></label>
            <si-select si-model="filter.data.contract" 
                si-change="filter.update()">
                <si-option value=""><?php _e('Any',SI) ?></si-option>
                <si-option ng-repeat="item in listing_ages" value="{{item.key}}">{{item.caption}}</si-option>
            </si-select>
        </si-input-container>
    </div>

    <!-- AVAIL. AREAS -->
    <div class="field-input field-available-areas"
            ng-if="configs.search_engine_options.fields.includes('available_area')">
           
        <si-input-container class="si-input-group">
            <span><?php _e('Area',SI) ?></span>
            <si-select si-model="filter.data.available_min" si-change="filter.update()" placeholder="Min">
                <si-option value=""><?php _e('Any',SI) ?></si-option>
                <si-option ng-repeat="item in available_areas" value="{{item.value}}">{{item.caption}}</si-option>
            </si-select>

            <span>-</span>
            <si-select si-model="filter.data.available_max"  si-change="filter.update()" placeholder="Max">
                <si-option value=""><?php _e('Any',SI) ?></si-option>
                <si-option ng-repeat="item in available_areas" value="{{item.value}}">{{item.caption}}</si-option>
            </si-select>
        </si-input-container>
    </div>

    <!-- PARKINGS -->
    <div class="field-input field-parkings"
            ng-if="configs.search_engine_options.fields.includes('parkings')">
        <si-input-container>
            <label><?php _e('Parkings',SI) ?></label>
            <si-select si-model="filter.data.parkings" si-change="filter.update()">
                <si-option value=""><?php _e('Any',SI) ?></si-option>
                <si-option ng-repeat="item in parkingSuggestions" value="{{item.value}}">{{item.label}}</si-option>
            </si-select>
        </si-input-container>
        
    </div>

</div>

<div class="search-action">
    <button type="button" class="trigger-button si-button" data-ng-show="result_url != null" data-ng-click="showResultPage()" title="<?php _e('Search', SI) ?>"><i class="fal fa-search"></i></button>
    <button type="button" class="reset-button si-button" data-ng-show="filter.hasFilters()" data-ng-click="resetFilters()" title="<?php _e('Reset', SI) ?>"><i class="fal fa-undo"></i></button>
</div>