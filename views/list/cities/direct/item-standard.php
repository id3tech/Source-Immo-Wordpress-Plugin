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

<article class="immodb-item immodb-city-item immodb-standard-item-layout <?php echo($configs->list_item_layout->scope_class) ?> <?php echo implode(' ',$classes) ?>"
    itemscope itemtype="http://schema.org/City">
    <a href="<?php echo($item->permalink) ?>">
        <div class="content">
            <div class="code"><?php echo($item->code) ?></div>
            <div class="name" itemprop="name"><?php echo($item->name) ?></div>
            <div class="listings-count"><?php echo($item->listings_count)?><label><?php _e( ($item->listings_count>1) ? 'properties' : 'property', IMMODB) ?></label></div>
            <div class="region" 
                itemscope itemtype="http://schema.org/Place" 
                itemprop="containedInPlace">
                <span itemprop="name"><?php echo($item->location->region);?></span>
            </div>
            <div class="region-code"><?php echo($item->region_code) ?></div>
        </div>
    </a>
</article>