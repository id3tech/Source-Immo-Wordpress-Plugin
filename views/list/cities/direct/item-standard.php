<?php
/**
 * Standard list item view
 */

$classes = array('city-' . $item->code, 'region-' . $item->region_code);
if($item->has_custom_page){
    $classes[] = 'si-has-custom-page';
}
if($item->listings_count > 100){
    $classes[] = 'si-cluster-huge';
}
else if($item->listings_count > 50){
    $classes[] = 'si-cluster-large';
}
else if($item->listings_count > 25){
    $classes[] = 'si-cluster-medium';
}
else if($item->listings_count > 12){
    $classes[] = 'si-cluster-small';
}


?>

<article class="si-item si-city-item si-standard-item-layout <?php echo($configs->list_item_layout->scope_class) ?> <?php echo implode(' ',$classes) ?>"
    itemscope itemtype="http://schema.org/City">
    <a href="<?php echo($item->permalink) ?>">
        <div class="si-item-content">
            <div class="si-layer-container">
            <?php
                siShowDirectItemLayer($item, $configs);
                ?>
            </div>
        </div>
    </a>
</article>