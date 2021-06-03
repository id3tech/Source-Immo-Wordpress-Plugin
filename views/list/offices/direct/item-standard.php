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
    data-agency-code="<?php echo($item->agency->ref_number) ?>"
    itemscope itemtype="http://schema.org/office">
    <a href="<?php echo($item->permalink) ?>" id="office-<?php echo($item->id) ?>">
        <div class="item-content">
            <div class="si-image-container">
                <div class="image"></div>
            </div>
            <div class="si-data-label si-background-high-contrast name" itemprop="name"
                <?php layoutAllowVar('name', $configs->list_item_layout) ?>>
                <?php echo($item->name) ?>
            </div>

            <div class="si-data-label agency-name"
                <?php layoutAllowVar('agency-name', $configs->list_item_layout) ?>>
                <?php echo($item->agency->name) ?>
            </div>

            <div class="si-data-label address"
                itemscope itemtype="http://schema.org/PostalAddress" 
                itemprop="address"
                <?php layoutAllowVar('address', $configs->list_item_layout) ?>>
                
                    <div itemprop="streetAddress"><?php echo($item->location->street_address) ?></div> 
                    <span itemprop="city"><?php echo($item->location->city) ?></span>, <span><?php echo($item->location->state) ?></span>, <span><?php echo($item->location->address->postal_code) ?></span>
                
            </div>

            <div class="office-counters  si-background-small-contrast  si-data-label" <?php layoutAllowVar('listing_count', $configs->list_item_layout) ?>>
                <div><i class="fal fa-home"></i> <em><?php echo($item->listings_count)?></em></div>
                <?php if(isset($item->brokers_count)){ ?><div><i class="fal fa-user-tie"></i> <em><?php echo($item->brokers_count)?></em></div><?php }?>
            </div>
        
        </div>
    </a>
</article>