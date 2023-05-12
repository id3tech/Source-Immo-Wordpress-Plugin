<?php
/**
 * Standard list item view
 */

//$regionCode = isset($item->location->region_code) ? $item->location->region_code : '';
$scope_class = ['si-item si-agency-item si-single-layer-item-layout', 'office-' . $item->ref_number];
$scope_class_hover = [];


if(isset($configs)){
    $scope_class[] = $configs->list_item_layout->scope_class;
    if(isset($configs->list_item_layout->scope_class_hover)) $scope_class_hover[] = $configs->list_item_layout->scope_class_hover;
}

if($item->has_custom_page){
    $scope_class[] = 'has-custom-page';
}


?>

<article class="<?php echo implode(' ',$scope_class) ?>"
    data-agency-code="<?php echo($item->ref_number) ?>"
    data-si-hover-class="<?php echo implode(' ',$scope_class_hover) ?>"
    itemscope itemtype="http://schema.org/office">
    <a href="<?php echo($item->permalink) ?>" id="agency-<?php echo($item->id) ?>">
        <div class="si-item-content">
            <div class="si-layer-container">
            <?php
            siShowDirectItemLayer($item, $configs);
            ?>
            </div>
        </div>
    </a>
</article>