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
            <div class="flags">
                <i class="video far fa-video"></i>
                <i class="virtual-tour far fa-street-view"></i>
            </div>
            <div class="open-houses">
                <div class="open-house-item">
                    <i class="fal fa-calendar-alt"></i> {{'Open house'.translate()}} <span am-time-ago="item.open_houses[0].start_date"></span>
                </div>
            </div>
        </div>
    </a>
</article>