<?php
/**
 * Standard list item view
 */
$scope_class = array('si-item si-broker-item si-standard-item-layout');
$attrs = array();
$styleActive = true;
// if(isset($configs)){
//     $scope_class[] = $configs->list_item_layout->scope_class;
    
//     if(isset( $configs->list_item_layout->use_styles) && $configs->list_item_layout->use_styles) $scope_class[] = 'si-stylized';
// }

if(isset($configs)){
    $scope_class[] = $configs->list_item_layout->scope_class;
    
    if(isset( $configs->list_item_layout->preset) && $configs->list_item_layout->preset) {
        $scope_class[] = 'style-' . $configs->list_item_layout->preset;
        $styleActive = $configs->list_item_layout->preset != 'custom';
    }

    if(isset( $configs->list_item_layout->image_hover_effect)){
        $scope_class[] = 'img-hover-effect-' . $configs->list_item_layout->image_hover_effect;    
        if($configs->list_item_layout->image_hover_effect == 'gallery'){
            $attrs[] = 'si-image-rotator="'. $item->ref_number . ':' . $configs->alias . '"';
        }
    }
}
?>
<article 
    class="<?php echo(implode(' ', $scope_class)) ?>" 
    <?php echo(implode(' ', $attrs)) ?>
    >
    <a href="<?php echo($item->permalink) ?>">
        <div class="item-content">
            <div class="image  si-lazy-loading">
                <img data-si-src="<?php echo($item->photo_url);?>" si-srcset="<?php echo(apply_filters('si_broker_srcset',$item->photo_url))?>" itemprop="image" />
            </div>
            <div class="si-data-label si-background-high-contrast fullname notranslate" <?php layoutAllowVar('fullname', $configs->list_item_layout) ?>><?php echo($item->first_name . ' ' . $item->last_name)?></div> 
            <div class="si-data-label si-background-high-contrast first-name notranslate" <?php layoutAllowVar('first_name', $configs->list_item_layout) ?>><?php echo($item->first_name)?></div> 
            <div class="si-data-label si-background-high-contrast last-name notranslate" <?php layoutAllowVar('last_name', $configs->list_item_layout) ?>><?php echo($item->last_name)?></div>
            
            
            <div class="si-data-label si-background-high-contrast title" title="<?php echo((strlen($item->license_type) > 40) ? $item->license_type : '')?>"
                <?php layoutAllowVar('title', $configs->list_item_layout) ?>><?php echo($item->license_type)?></div>

            <div class="si-data-label office si-background-small-contrast notranslate" <?php layoutAllowVar('office', $configs->list_item_layout) ?>><?php echo($item->office->name)?></div>
            <div class="si-data-label phone" <?php layoutAllowVar('phone', $configs->list_item_layout) ?>><?php echo(isset($item->phones->mobile) ? $item->phones->mobile : $item->phones->office)?></div>
            <div class="si-data-label email" <?php layoutAllowVar('email', $configs->list_item_layout) ?>><?php echo($item->email)?></div>
            <div class="si-data-label si-background-small-contrast listing-count" <?php layoutAllowVar('listing_count', $configs->list_item_layout) ?>>
                <?php echo($item->listings_count == 0 ? __("No listing",SI) : ($item->listings_count==1) ? __("1 listing",SI) : StringPrototype::format(__("{0} listings",SI),$item->listings_count) )?>
            </div>
        </div>
    </a>
</article>