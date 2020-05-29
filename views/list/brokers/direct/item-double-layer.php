<?php
/**
 * Double-layer list item view
 */

$scope_class = array('si-item si-broker-item si-double-layer-item-layout ');
$attrs = array();
$styleActive = true;

if(isset($configs)){
    $scope_class[] = $configs->list_item_layout->scope_class;
    if(isset( $configs->list_item_layout->image_hover_effect)) $scope_class[] = 'img-hover-' . $configs->list_item_layout->image_hover_effect;
    if($configs->list_item_layout->image_hover_effect == 'gallery'){
        $attrs[] = 'si-image-rotator="'. $item->ref_number . ':' . $configs->alias . '"';
    }
    if(isset( $configs->list_item_layout->preset) && $configs->list_item_layout->preset) {
        $scope_class[] = 'style-' . $configs->list_item_layout->preset;
        $styleActive = $configs->list_item_layout->preset != 'custom';
    }
    if(isset( $configs->list_item_layout->secondary_layer_effect)) $scope_class[] = 'layer-hover-' . $configs->list_item_layout->secondary_layer_effect;
    if(isset( $configs->list_item_layout->primary_layer_position)) $scope_class[] = 'primary-layer-' . $configs->list_item_layout->primary_layer_position;
    if(isset( $configs->list_item_layout->use_styles) ){
        $scope_class[] = ($configs->list_item_layout->use_styles == true) ? 'si-stylized' : 'si-no-styles';
    }
}
?>
<article class="<?php echo(implode(" ", $scope_class)) ?>"  <?php echo(implode(' ', $attrs)) ?>>
    <a href="<?php echo($item->permalink) ?>">
        <div class="item-content">
            <div class="layer-container">
                <div class="image  si-lazy-loading">
                    <img data-si-src="<?php echo($item->photo_url);?>" si-srcset="<?php echo(apply_filters('si_broker_srcset',$item->photo_url))?>" itemprop="image" />
                </div>

                <div class="layer primary-layer">
                    <div class="si-data-label si-background-high-contrast fullname" <?php layoutAllowVar('fullname', $configs->list_item_layout) ?>><?php echo($item->first_name . ' ' . $item->last_name)?></div> 
                    <div class="si-data-label si-background-high-contrast first-name" <?php layoutAllowVar('first_name', $configs->list_item_layout) ?>><?php echo($item->first_name)?></div> 
                    <div class="si-data-label si-background-high-contrast last-name" <?php layoutAllowVar('last_name', $configs->list_item_layout) ?>><?php echo($item->last_name)?></div>
                    
                    
                    <div class="si-data-label si-background-high-contrast title" title="<?php echo((strlen($item->license_type) > 40) ? $item->license_type : '')?>"
                        <?php layoutAllowVar('title', $configs->list_item_layout) ?>><?php echo($item->license_type)?></div>

                    <div class="si-data-label phone" <?php layoutAllowVar('phone', $configs->list_item_layout) ?>><?php echo(isset($item->phones->mobile) ? $item->phones->mobile : $item->phones->office)?></div>
                    <div class="si-data-label email" <?php layoutAllowVar('email', $configs->list_item_layout) ?>><?php echo($item->email)?></div>
                    <div class="si-data-label si-background-small-contrast listing-count" <?php layoutAllowVar('listing_count', $configs->list_item_layout) ?>>
                        <?php echo($item->listings_count == 0 ? __("No listing",SI) : ($item->listings_count==1) ? __("1 listing",SI) : StringPrototype::format(__("{0} listings",SI),$item->listings_count) )?>
                    </div>
                </div>

                <div class="layer secondary-layer"
                    style="<?php 
                        if(isset( $configs->list_item_layout->secondary_layer_bg_opacity)) echo('--bg-opacity:' . ($configs->list_item_layout->secondary_layer_bg_opacity/100));
                    ?>">
                    <div class="si-data-label fullname" <?php layoutAllowVar('fullname', $configs->list_item_layout,'secondary') ?>><?php echo($item->first_name . ' ' . $item->last_name)?></div> 
                    <div class="si-data-label first-name" <?php layoutAllowVar('first_name', $configs->list_item_layout,'secondary') ?>><?php echo($item->first_name)?></div> 
                    <div class="si-data-label last-name" <?php layoutAllowVar('last_name', $configs->list_item_layout,'secondary') ?>><?php echo($item->last_name)?></div>
                    
                    
                    <div class="si-data-label title" title="<?php echo((strlen($item->license_type) > 40) ? $item->license_type : '')?>"
                        <?php layoutAllowVar('title', $configs->list_item_layout,'secondary') ?>><?php echo($item->license_type)?></div>

                    <div class="si-data-label phone" <?php layoutAllowVar('phone', $configs->list_item_layout,'secondary') ?>><?php echo(isset($item->phones->mobile) ? $item->phones->mobile : $item->phones->office)?></div>
                    <div class="si-data-label email" <?php layoutAllowVar('email', $configs->list_item_layout,'secondary') ?>><?php echo($item->email)?></div>
                    <div class="si-data-label listing-count" <?php layoutAllowVar('listing_count', $configs->list_item_layout,'secondary') ?>>
                        <?php echo($item->listings_count == 0 ? __("No listing",SI) : ($item->listings_count==1) ? __("1 listing",SI) : StringPrototype::format(__("{0} listings",SI),$item->listings_count) )?>
                    </div>
                </div>
            </div>
        </div>
    </a>
</article>