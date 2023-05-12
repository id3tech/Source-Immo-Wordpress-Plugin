<?php
$scope_class = array('si-item si-listing-item si-single-layer-item-layout si-background');
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

    if(isset( $configs->list_item_layout->preset) && $configs->list_item_layout->preset) {
        $scope_class[] = 'si-style-' . $configs->list_item_layout->preset;
        $styleActive = $configs->list_item_layout->preset != 'custom';
    }

    if(isset( $configs->list_item_layout->image_hover_effect)){
        $scope_class[] = 'si-img-hover-effect-' . $configs->list_item_layout->image_hover_effect;    
        if($configs->list_item_layout->image_hover_effect == 'gallery'){
            $attrs[] = 'si-image-rotator="'. $item->ref_number . ':' . $configs->alias . '"';
        }
    }
}

if($item->status_code=='SOLD'){
    $scope_class[] = 'sold';
}

?>

<article class="<?php echo implode(' ',$scope_class) ?>" 
    data-test="true"
    data-ng-mouseover="handleListItemOver($event,item)"
    data-si-hover-class="<?php echo implode(' ',$scope_class_hover) ?>"
    <?php echo(implode(' ', $attrs)) ?> itemscope itemtype="http://schema.org/Residence">
    <a itemprop="url" href="<?php echo($item->permalink) ?>">
        <div class="si-item-content">
            <div class="si-layer-container">
                <?php
                siShowDirectItemLayer($item, $configs);
                ?>
            </div>
        </div>
    </a>
</article>