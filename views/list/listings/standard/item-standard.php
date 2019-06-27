<?php
/**
 * Standard list item view
 */
$scope_class = '';
if(isset($configs)){
    $scope_class = $configs->list_item_layout->scope_class;
}
?>
<article class="si-item si-listing-item si-standard-item-layout <?php echo($scope_class) ?> {{getClassList(item)}}" ng-cloak>
    <a href="{{item.permalink}}">
        <div class="content">
            <div class="image"><img data-ng-src="{{item.photo_url}}" data-si-srcset="{{item.photo_url}}" /></div>
            <div class="price">{{formatPrice(item)}}</div>
            <div class="civic-address">{{item.location.civic_address}}</div>
            <div class="ref-number">{{item.ref_number}}</div>
            <div class="city">{{item.location.city}}</div>
            <div class="region">{{item.location.region}}</div>
            <div class="category">{{item.category }}</div>
            <div class="subcategory">{{item.subcategory}}</div>
            <div class="description">{{item.description}}</div>
            <div class="rooms">
                <div class="room {{icon}}" ng-repeat="(icon,room) in item.rooms"><i class="icon fal fa-fw fa-{{icon}}"></i> <span class="count">{{room.count}}</span> <span class="label">{{room.label}}</span></div>
            </div>
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