<?php
/**
 * Standard list item view
 */
$scope_class = array('si-item si-listing-item si-single-layer-item-layout si-background');
$scope_class_hover = [];
$attrs = array();
$styleActive = true;

if(isset($configs)){
    $scope_class[] = $configs->list_item_layout->scope_class;
    if(isset($configs->list_item_layout->scope_class_hover)) $scope_class_hover[] = $configs->list_item_layout->scope_class_hover;

    if(isset( $configs->list_item_layout->preset)) {
        $scope_class[] = 'style-' . $configs->list_item_layout->preset;
        $styleActive = $configs->list_item_layout->preset != 'custom';
    }

    
    if(isset( $configs->list_item_layout->image_hover_effect)){
        $scope_class[] = 'img-hover-effect-' . $configs->list_item_layout->image_hover_effect;    
        if($configs->list_item_layout->image_hover_effect == 'gallery'){
            $attrs[] = 'si-image-rotator="{{item.ref_number}}:' . $configs->alias . '"';
        }
    }
}
?>

<article 
    class="<?php echo(implode(' ', $scope_class)) ?> {{getClassList(item)}}" ng-cloak
        data-si-hover-class="<?php echo implode(' ',$scope_class_hover) ?>"
        <?php echo(implode(' ', $attrs)) ?> >
        
    <a href="{{item.permalink}}" ng-if="item">
        <div class="item-content">
            <div class="layer-container">
                <?php siShowStandardItemLayer($configs) ?>
            </div>
        </div>
    </a>
</article>