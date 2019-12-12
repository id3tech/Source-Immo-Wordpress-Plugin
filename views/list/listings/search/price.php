<div class="filter-panel price-panel {{isExpanded('price')}}">
        <div class="panel-header">
            <h4><?php _e('Price', SI) ?></h4>
            <button class="button" type="button"  ng-click="toggleExpand($event,'price')"><i class="fal fa-times"></i></button>
        </div>
    
        <div class="filter-panel-content">
            

            <div class="price-inputs">
                <si-slider model="priceRange" step="0.05" on-change="updatePrice()" start-label="Min" end-label="<?php _e('Unlimited',SI) ?>"></si-slider>
                <div class="min">
                    <em><?php _e('Minimal price', SI) ?></em>
                    <h2 class="price-value">{{getPriceFromScale(priceRange[0],10000)}}</h2>
                </div>
                
                <i class="price-divider fal fa-3x fa-arrows-h"></i>

                <div class="max">
                    <em><?php _e('Maximal price', SI) ?></em>
                    <h2 class="price-value">{{getPriceFromScale(priceRange[2],-10000,1000000,'<?php _e('Unlimited',SI) ?>')}}</h2>
                </div>

            </div>
        </div>
    </div>
