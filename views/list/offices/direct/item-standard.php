<?php
/**
 * Standard list item view
 */

$regionCode = isset($item->location->region_code) ? $item->location->region_code : '';
$classes = array('office-' . $item->ref_number, 'region-' . $regionCode);
$scope_class_hover = [];
if(isset($configs->list_item_layout->scope_class_hover)) $scope_class_hover[] = $configs->list_item_layout->scope_class_hover;

if($item->has_custom_page){
    $classes[] = 'has-custom-page';
}


?>

<article class="si-item si-office-item si-single-layer-item-layout <?php echo($configs->list_item_layout->scope_class) ?> <?php echo implode(' ',$classes) ?>"
    data-si-hover-class="<?php echo implode(' ',$scope_class_hover) ?>"
    data-agency-code="<?php echo($item->agency->ref_number) ?>"
    itemscope itemtype="http://schema.org/office">
    <a href="<?php echo($item->permalink) ?>" id="office-<?php echo($item->id) ?>">
        <div class="item-content">
            <div class="layer-container">
                <?php
                siShowDirectItemLayer($item, $configs);
                ?>
            </div>
        </div>
    </a>
</article>