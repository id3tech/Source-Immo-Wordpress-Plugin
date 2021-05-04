<?php
$panelKey = 'price';
?>

<div class="filter-panel price-panel {{isExpanded('<?php echo($panelKey) ?>')}}">
        <div class="filter-panel-header">
            <h4><?php echo(apply_filters('si_label', __('Price', SI))) ?></h4>
            <button class="button" type="button"  ng-click="toggleExpand($event,'<?php echo($panelKey) ?>')"><i class="fal fa-times"></i></button>
        </div>
    
        <div class="filter-panel-content">
            
            <div class="price-inputs">
                <si-price-range-slider 
                    model="priceRange" on-change="updatePrice()" 
                    start-label="Min" 
                    end-label="<?php echo(apply_filters('si_label', __('Unlimited',SI))) ?>"
                    ></si-price-range-slider>
                <div class="min">
                    <em><?php echo(apply_filters('si_label', __('Minimal price', SI))) ?></em>
                    <h2 class="price-value">{{getMinPriceLabel('<?php echo(apply_filters('si_label', __('Min',SI))) ?>')}}</h2>
                </div>
                
                <i class="price-divider fal fa-3x fa-arrows-h"></i>

                <div class="max">
                    <em><?php echo(apply_filters('si_label', __('Maximal price', SI))) ?></em>
                    <h2 class="price-value">{{getMaxPriceLabel('<?php echo(apply_filters('si_label', __('Unlimited',SI))) ?>')}}</h2>
                </div>

            </div>
        </div>

        <div class="filter-panel-actions">
        <?php include '_actions.php'; ?>
        </div>
    </div>
