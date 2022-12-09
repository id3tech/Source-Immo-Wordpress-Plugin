<?php
$panelKey = 'price';
?>

<div class="filter-panel price-panel {{isExpanded('<?php echo($panelKey) ?>')}}">
        <div class="filter-panel-header">
            <div  class="si-panel-header-title"><?php si_label('Price') ?></div>
            <button class="si-button" type="button"  ng-click="toggleExpand($event,'<?php echo($panelKey) ?>')"><i class="fal fa-times"></i></button>
        </div>
    
        <div class="filter-panel-content">
            
            <div class="price-inputs">
                <si-price-range-slider 
                    model="priceRange" on-change="updatePrice()" 
                    start-label="Min" 
                    end-label="<?php si_label('Unlimited') ?>"
                    ></si-price-range-slider>
                <div class="min">
                    <em><?php si_label('Minimum') ?></em>
                    <h2 class="price-value">{{getMinPriceLabel('<?php si_label('Min') ?>')}}</h2>
                </div>
                
                <i class="price-divider fal fa-3x fa-arrows-h"></i>

                <div class="max">
                    <em><?php si_label('Maximum') ?></em>
                    <h2 class="price-value">{{getMaxPriceLabel('<?php si_label('Unlimited') ?>')}}</h2>
                </div>

            </div>
        </div>

        <div class="filter-panel-actions">
        <?php include '_actions.php'; ?>
        </div>
    </div>
