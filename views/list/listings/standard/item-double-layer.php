<?php
/**
 * Standard list item view
 */
$scope_class = array();
$scope_class_hover = [];

$styleActive = true;
if(isset($configs)){
    $scope_class[] = $configs->list_item_layout->scope_class;
    if(isset( $configs->list_item_layout->image_hover_effect)) $scope_class[] = 'img-hover-' . $configs->list_item_layout->image_hover_effect;
    if(isset( $configs->list_item_layout->secondary_layer_effect)) $scope_class[] = 'layer-hover-' . $configs->list_item_layout->secondary_layer_effect;
    if(isset( $configs->list_item_layout->primary_layer_position)) $scope_class[] = 'primary-layer-' . $configs->list_item_layout->primary_layer_position;
    if(isset( $configs->list_item_layout->preset)) {
        $styleActive = $configs->list_item_layout->preset != 'custom';
        $scope_class[] = 'style-' . $configs->list_item_layout->preset;
    }

    if(!isset($configs->list_item_layout->secondary_layer_bg_opacity) || ($configs->list_item_layout->secondary_layer_bg_opacity == 100)){
        $scope_class[] = 'si-opaque-secondary-layer';
    }

    if(isset($configs->list_item_layout->scope_class_hover)) $scope_class_hover[] = $configs->list_item_layout->scope_class_hover;
}
?>
<article class="si-item si-listing-item si-double-layer-item-layout  si-background  <?php echo(implode(" ", $scope_class)) ?> {{getClassList(item)}}"  data-si-hover-class="<?php echo implode(' ',$scope_class_hover) ?>" ng-cloak>
    <a href="{{item.permalink}}">
        <div class="item-content">
            <div class="layer-container">
                <!-- <div class="image si-lazy-loading">
                    <img data-si-src="{{item.photo_url}}" data-si-srcset="{{item.photo_url}}" />
                </div> -->
                

                <?php siShowStandardItemLayer($configs) ?>

                <?php siShowStandardItemLayer($configs,'secondary') ?>

            </div>
        </div>
    </a>
</article>