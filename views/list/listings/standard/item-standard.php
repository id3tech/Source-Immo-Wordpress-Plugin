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
        <div class="item-content">
            <div class="image si-lazy-loading"><img data-si-src="{{item.photo_url}}" data-si-srcset="{{item.photo_url}}" /></div>
            <div class="si-data-label civic-address" ng-show="layoutAllowVar('address')">{{item.location.civic_address}}</div>
            <div class="si-data-label city" ng-show="layoutAllowVar('city')">{{item.location.city}}</div>
            <div class="si-data-label region" ng-show="layoutAllowVar('region')">{{item.location.region}}</div>
            <div class="si-data-label price" ng-show="layoutAllowVar('price')">{{formatPrice(item)}}</div>

            <div class="si-data-label category" ng-show="layoutAllowVar('category')">{{item.category }}</div>
            <div class="si-data-label subcategory" ng-show="layoutAllowVar('subcategory')">{{item.subcategory}}</div>
            <div class="si-data-label ref-number" ng-show="layoutAllowVar('ref_number')">{{item.ref_number}}</div>

            <div class="si-data-label rooms" ng-show="layoutAllowVar('rooms')">
                <div class="room {{icon}}" ng-repeat="(icon,room) in item.rooms"><i class="icon fal fa-fw fa-{{icon}}"></i> <span class="count">{{room.count}}</span> <span class="label">{{room.label}}</span></div>
            </div>
            
            <div class="si-data-label available_area" ng-show="layoutAllowVar('available_area')">{{item.available_area}} {{item.available_area_unit}}</div>

            <div class="si-data-label description" ng-show="layoutAllowVar('description')">{{item.description}}</div>
            
            <div class="flags" ng-show="layoutAllowVar('flags')">
                <i class="video far fa-video"></i>
                <i class="virtual-tour far fa-street-view"></i>
            </div>
            <div class="si-data-label open-houses" ng-show="layoutAllowVar('open_houses')">
                <div class="open-house-item">
                    <i class="fal fa-calendar-alt"></i> <span>{{'Open house'.translate()}}</span> <span am-time-ago="item.open_houses[0].start_date"></span>
                </div>
            </div>
        </div>
    </a>
</article>