<?php
/**
 * Standard list item view
 */
$scope_class = '';
if(isset($configs) && $configs !== false){
    $scope_class = (isset($configs->list_item_layout)) ? $configs->list_item_layout->scope_class : [];
}
else{
    $configs = new SourceImmoList('','listings','listings','',['address','city','price','category','subcategory','rooms']);
    //$configs->type = 'listings';
    //$configs->list_item_layout->displayed_vars->main = ['address','city','price','category','subcategory','rooms'];
}
?>
<article class="si-item si-listing-item  si-single-layer-item-layout style-standard si-border <?php echo($scope_class) ?> {{getClassList(item)}}"  
    data-ng-cloak>
    <a href="{{item.permalink}}">
        <div class="si-item-content">
            <div class="si-layer-container">
            <?php siShowStandardItemLayer($configs) ?>
                
        </div>
    </a>
</article>
<?php
