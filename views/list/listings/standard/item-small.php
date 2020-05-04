<?php
/**
 * Standard list item view
 */
$scope_class = '';
if(isset($configs)){
    $scope_class = $configs->list_item_layout->scope_class;
}
?>
<article class="si-item si-listing-item  si-single-layer-item-layout style-standard <?php echo($scope_class) ?> {{getClassList(item)}}"  
    data-ng-cloak>
    <a href="{{item.permalink}}">
        <div class="item-content">
            <div class="image si-lazy-loading"><img data-si-src="{{item.photo_url}}"  data-si-srcset="{{item.photo_url}}" /></div>
            <div class="si-data-label si-background-high-contrast civic-address" >{{item.location.civic_address}}&nbsp;</div>
            <div class="si-data-label si-background-high-contrast city" >{{item.location.city}}</div>
            <div class="si-data-label si-background-medium-contrast price" >{{formatPrice(item)}}</div>
            <div class="si-data-label category">{{item.category }}</div>
            <div class="si-data-label subcategory" >{{item.subcategory}}</div>
            <div class="flags">
                <i class="video far fa-video"></i>
                <i class="virtual-tour far fa-street-view"></i>
            </div>
            <div class="si-data-label rooms" >
                <div class="room {{icon}}" ng-repeat="(icon,room) in item.rooms"><i class="icon fal fa-fw fa-{{icon}}"></i> <span class="count">{{room.count}}</span> <span class="label">{{room.label}}</span></div>
            </div>
            <div class="si-data-label open-houses">
                <div class="open-house-item">
                    <i class="fal fa-calendar-alt"></i> <span>{{'Open house'.translate()}}</span> <span data-am-time-ago="item.open_houses[0].start_date"></span>
                </div>
            </div>
        </div>
    </a>
</article>