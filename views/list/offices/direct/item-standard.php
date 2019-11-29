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
            <h3 class="name" itemprop="name"><?php echo($item->name) ?></h3>
            <div class="region" 
                itemscope itemtype="http://schema.org/Place" 
                itemprop="containedInPlace">
                <span itemprop="name"><?php echo($item->location->region);?></span>
            </div>

            <div class="infos">
                <div class="info-item address"
                    itemscope itemtype="http://schema.org/PostalAddress" 
                    itemprop="address">
                    <i class="fal fa-map-marker-alt"></i>
                    <div class="info-content">
                        <div itemprop="streetAddress"><?php echo($item->location->street_address) ?></div> 
                        <span itemprop="city"><?php echo($item->location->city) ?></span>, <span><?php echo($item->location->state) ?></span>, <span><?php echo($item->location->address->postal_code) ?></span>
                    </div>
                </div>
            </div>
        </div>
    </a>
</article>