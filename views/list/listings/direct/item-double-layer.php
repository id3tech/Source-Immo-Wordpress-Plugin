<?php
$scope_class = array('si-item si-listing-item si-double-layer-item-layout');
$scope_class_hover = [];
$attrs = array();
$styleActive = true;

if(isset($item->open_houses) && count($item->open_houses)>0){
    $scope_class[] = 'has-open-house';
}
if($item->status_code=='SOLD'){
    $scope_class[] = 'sold';
}

if(isset($configs)){
    $scope_class[] = $configs->list_item_layout->scope_class;
    if(isset($configs->list_item_layout->scope_class_hover)) $scope_class_hover[] = $configs->list_item_layout->scope_class_hover;

    if(isset( $configs->list_item_layout->image_hover_effect)) $scope_class[] = 'img-hover-' . $configs->list_item_layout->image_hover_effect;
    if(isset( $configs->list_item_layout->secondary_layer_effect)) $scope_class[] = 'layer-hover-' . $configs->list_item_layout->secondary_layer_effect;
    if(isset( $configs->list_item_layout->primary_layer_position)) $scope_class[] = 'primary-layer-' . $configs->list_item_layout->primary_layer_position;

    if(isset( $configs->list_item_layout->preset) && $configs->list_item_layout->preset) {
        $scope_class[] = 'style-' . $configs->list_item_layout->preset;
        $styleActive = $configs->list_item_layout->preset != 'custom';
    }

    if(isset( $configs->list_item_layout->image_hover_effect)){
        if($configs->list_item_layout->image_hover_effect == 'gallery'){
            $attrs[] = 'si-image-rotator="'. $item->ref_number . ':' . $configs->alias . '"';
        }
    }
}

?>

<article  class="<?php echo implode(' ',$scope_class) ?>"  data-si-hover-class="<?php echo implode(' ',$scope_class_hover) ?>"
    <?php echo(implode(' ', $attrs)) ?> itemscope itemtype="http://schema.org/Residence">

    <a itemprop="url" href="<?php echo($item->permalink) ?>">
        <div class="item-content">
            <div class="layer-container">
                <div class="image si-lazy-loading"><img si-src="<?php echo($item->photo_url);?>" si-srcset="<?php echo(apply_filters('si_listing_srcset',$item->photo_url))?>" itemprop="image" /></div>

                <?php
                siShowDirectItemLayer($item,$configs);

                siShowDirectItemLayer($item,$configs,'secondary');
                ?>

            </div>
        </div>
    </a>
</article>