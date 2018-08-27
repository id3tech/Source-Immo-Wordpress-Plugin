<?php
/**
 * Standard list item view
 */
$scope_class = '';
if(isset($configs)){
    $scope_class = $configs->list_item_layout->scope_class;
}
?>
<article class="immodb-item immodb-listing-item immodb-standard-item-layout <?php echo($scope_class) ?> {{getClassList(item)}}" ng-cloak>
    <a href="/<?php echo(ImmoDB::current()->get_listing_permalink()) ?>">
        <div class="content">
            <div class="image"><img ng-src="{{item.photo_url}}" /></div>
            <div class="price">{{formatPrice(item)}}</div>
            <div class="civic-address">{{item.location.civic_address}}</div>
            <div class="ref-number">{{item.ref_number}}</div>
            <div class="city">{{getCaption(item.location.city_code , 'city')}}</div>
            <div class="region">{{getCaption(item.location.region_code , 'region')}}</div>
            <div class="category">{{getCaption(item.category_code , 'listing_category')}}</div>
            <div class="subcategory">{{getCaption(item.subcategory_code , 'listing_subcategory')}}</div>
            <div class="description">{{item.description}}</div>
        </div>
    </a>
</article>