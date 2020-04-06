<?php
/**
 * Standard list item view
 */

$regionCode = isset($item->location->region_code) ? $item->location->region_code : '';
$classes = array('office-' . $item->ref_number, 'region-' . $regionCode);
if($item->has_custom_page){
    $classes[] = 'has-custom-page';
}

?>

<article class="si-item si-office-item si-standard-item-layout <?php echo($configs->list_item_layout->scope_class) ?> <?php echo implode(' ',$classes) ?>"
    itemscope itemtype="http://schema.org/office">
    <a href="<?php echo($item->permalink) ?>" id="office-<?php echo($item->id) ?>">
        <div class="item-content">
            <div class="si-data-label si-background-high-contrast name" itemprop="name"
                <?php layoutAllowVar('name', $configs->list_item_layout) ?>><?php echo($item->name) ?></div>

            <?php 
            if(!str_null_or_empty($item->location->region)){
            ?>
            <div class="si-data-label si-background-medium-contrast region" 
                itemscope itemtype="http://schema.org/Place" 
                itemprop="containedInPlace"
                <?php layoutAllowVar('region', $configs->list_item_layout) ?>>
                <span itemprop="name"><?php echo($item->location->region);?></span>
            </div>
            <?php
            }
            ?>
            <div class="si-data-label address"
                itemscope itemtype="http://schema.org/PostalAddress" 
                itemprop="address"
                <?php layoutAllowVar('address', $configs->list_item_layout) ?>>
                <i class="fal fa-map-marker-alt"></i>
                <div class="info-content">
                    <div itemprop="streetAddress"><?php echo($item->location->street_address) ?></div> 
                    <span itemprop="city"><?php echo($item->location->city) ?></span>, <span><?php echo($item->location->state) ?></span>, <span><?php echo($item->location->address->postal_code) ?></span>
                </div>
            </div>
        
            <div class="listings-count si-background-small-contrast si-data-label" <?php layoutAllowVar('listing_count', $configs->list_item_layout) ?>><?php echo($item->listings_count)?><label> <?php _e( ($item->listings_count>1) ? 'properties' : 'property', SI) ?></label></div>
        </div>
    </a>
</article>