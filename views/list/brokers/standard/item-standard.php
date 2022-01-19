<?php
/**
 * Standard list item view
 */
$scope_class = array();
if(isset($configs)){
    $scope_class[] = $configs->list_item_layout->scope_class;
    
    if(isset( $configs->list_item_layout->use_styles) && $configs->list_item_layout->use_styles) $scope_class[] = 'si-stylized';
}
?>
<article class="si-item si-broker-item si-single-layer-item-layout si-background
        <?php echo(implode(' ', $scope_class)) ?> {{getClassList(item)}}" 
        data-ng-cloak
    >
    <a href="{{item.permalink}}">
        <div class="item-content">
            <div class="layer-container">

                
                <?php siShowStandardItemLayer($configs) ?>
            </div>
        </div>
    </a>
</article>