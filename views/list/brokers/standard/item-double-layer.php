<?php
/**
 * Standard list item view
 */
$scope_class = array();
$scope_class_hover = [];
if(isset($configs)){
    $scope_class[] = $configs->list_item_layout->scope_class;
    if(isset($configs->list_item_layout->scope_class_hover)) $scope_class_hover[] = $configs->list_item_layout->scope_class_hover;

    if(isset( $configs->list_item_layout->image_hover_effect)) $scope_class[] = 'img-hover-' . $configs->list_item_layout->image_hover_effect;
    if(isset( $configs->list_item_layout->secondary_layer_effect)) $scope_class[] = 'layer-hover-' . $configs->list_item_layout->secondary_layer_effect;
    if(isset( $configs->list_item_layout->primary_layer_position)) $scope_class[] = 'primary-layer-' . $configs->list_item_layout->primary_layer_position;
    if(isset( $configs->list_item_layout->use_styles) ){
        $scope_class[] = ($configs->list_item_layout->use_styles == true) ? 'si-stylized' : 'si-no-styles';
    }
}
?>
<article class="si-item si-broker-item si-double-layer-item-layout <?php echo(implode(" ", $scope_class)) ?> {{getClassList(item)}}"
    data-si-hover-class="<?php echo implode(' ',$scope_class_hover) ?>" ng-cloak>
    <a href="{{item.permalink}}">
        <div class="item-content">
            <div class="layer-container">
            <?php siShowStandardItemLayer($configs) ?>

            <?php siShowStandardItemLayer($configs,'secondary') ?>

            </div>
        </div>
    </a>
</article>