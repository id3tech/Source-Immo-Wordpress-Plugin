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
            <div class="layer-container">
            <?php
                siShowDirectItemLayer($item, $configs);
                ?>
            </div>
        </div>
    </a>
</article>