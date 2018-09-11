<?php
/**
 * Standard list item view
 */
$scope_class = '';
if(isset($configs)){
    $scope_class = $configs->list_item_layout->scope_class;
}
?>
<article class="immodb-item immodb-listing-item immodb-small-item-layout <?php echo($scope_class) ?> {{getClassList(item)}}"  
    ng-cloak>
    <a href="/<?php echo(ImmoDB::current()->get_listing_permalink()) ?>">
        <div class="content">
            <div class="image"><img ng-src="{{item.photo_url}}" /></div>
            <div class="civic-address">{{item.location.civic_address}}</div>
            <div class="price">{{formatPrice(item)}}</div>
            <div class="city">{{item.location.city}}</div>
            <div class="category">{{item.category}}</div>
            <div class="subcategory">{{item.subcategory}}</div>
        </div>
    </a>
</article>