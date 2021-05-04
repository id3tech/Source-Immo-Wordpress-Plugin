<?php
/**
 * Standard list item view
 */

$classes = array('city-' . $item->code, 'region-' . $item->region_code);
if($item->has_custom_page){
    $classes[] = 'has-custom-page';
}
if($item->listings_count > 100){
    $classes[] = 'cluster-huge';
}
else if($item->listings_count > 50){
    $classes[] = 'cluster-large';
}
else if($item->listings_count > 25){
    $classes[] = 'cluster-medium';
}
else if($item->listings_count > 12){
    $classes[] = 'cluster-small';
}

?>

<article class="si-item si-city-item si-standard-item-layout <?php echo($configs->list_item_layout->scope_class) ?> <?php echo implode(' ',$classes) ?>"
    itemscope itemtype="http://schema.org/City">
    <a href="<?php echo($item->permalink) ?>">
        <div class="item-content">
            <div class="name si-data-label si-background-high-contrast" <?php layoutAllowVar('name', $configs->list_item_layout) ?> itemprop="name"><?php echo(apply_filters('si-city-name', $item->name, 'city')) ?></div>
            <div class="code si-data-label si-background-high-contrast" <?php layoutAllowVar('code', $configs->list_item_layout) ?>><?php echo($item->code) ?></div>
            <div class="region si-data-label si-background-small-contrast " <?php layoutAllowVar('region', $configs->list_item_layout) ?>
                itemscope itemtype="http://schema.org/Place" 
                itemprop="containedInPlace">
                <span itemprop="name"><?php echo($item->location->region);?></span>
            </div>
            <div class="listings-count si-data-label" <?php layoutAllowVar('listing_count', $configs->list_item_layout) ?>><?php echo($item->listings_count)?><label> <?php echo(apply_filters('si_label', __( ($item->listings_count>1) ? 'properties' : 'property', SI))) ?></label></div>
            <div class="region-code"><?php echo($item->region_code) ?></div>
        </div>
    </a>
</article>