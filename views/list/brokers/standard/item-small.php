<?php
/**
 * Standard list item view
 */
$scope_class = '';
if(isset($configs) && $configs !== false){
    $scope_class = (isset($configs->list_item_layout)) ? $configs->list_item_layout->scope_class : [];
}
else{
    $configs = new SourceImmoList('','brokers','brokers','',['first_name','last_name','license_type']);
    //$configs->type = 'listings';
    //$configs->list_item_layout->displayed_vars->main = ['address','city','price','category','subcategory','rooms'];
}
?>
<article class="si-item si-broker-item si-single-layer-item-layout si-background
        <?php echo($scope_class) ?> {{getClassList(item)}}" 
        data-ng-cloak
    >
    <a href="{{item.permalink}}">
        <div class="si-item-content">
            <div class="si-layer-container">
                <?php siShowStandardItemLayer($configs) ?>
            </div>
        </div>
    </a>
</article>

<!-- 
<article class="si-item si-broker-item si-small-item-layout
                    <?php echo($configs->list_item_layout->scope_class) ?> {{getClassList(item)}}" 
        data-ng-cloak
    >
    <a href="{{item.permalink}}">
        <div class="item-content">
            <div class="image  si-lazy-loading"><img data-ng-if="item.photo_url" data-si-src="{{item.photo_url}}" /></div>
            <div class="si-data-label si-background-high-contrast notranslate first-name">{{item.first_name}}</div> 
            <div class="si-data-label si-background-high-contrast notranslate last-name">{{item.last_name}}</div>
            
            <div class="si-data-label title" title="{{item.license_type.length > 40 ? item.license_type : ''}}">{{item.license_type}}</div>
        </div>
    </a>
</article> -->