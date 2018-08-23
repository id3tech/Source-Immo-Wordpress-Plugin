<?php
/**
 * Standard list item view
 */
$scope_class = '';
if(isset($configs)){
    $scope_class = $configs->list_item_layout->scope_class;
}
?>
<article class="immodb-item <?php echo($scope_class) ?> {{getClassList(item)}}"  
    ng-repeat="item in list track by item.id" ng-cloak>
    <a href="/<?php echo(ImmoDB::current()->get_listing_permalink()) ?>">
        <div class="content">
            <div class="image"><img ng-src="{{item.photo_url}}" /></div>
            <div class="price">{{formatPrice(item)}}</div>
            <div class="city">{{getCaption(item.location.city_code , 'city')}}</div>
            <div class="category">{{getCaption(item.category , 'listing_category')}}</div>
            <div class="subcategory">{{getCaption(item.subcategory , 'listing_subcategory')}}</div>
        </div>
    </a>
</article>