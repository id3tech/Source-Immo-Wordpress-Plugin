
<div class="si-label price si-space-emphasis si-big-emphasis" ng-show="layoutAllowVar('price','<?php echo $layerName ?>')">{{formatPrice(item)}}</div> 
<div class="si-label si-price-sold si-space-emphasis si-big-emphasis" ng-show="layoutAllowVar('price','<?php echo $layerName ?>')">{{formatPrice(item)}}</div>    

<div class="si-label city  si-text-truncate si-weight-emphasis" ng-show="layoutAllowVar('city','<?php echo $layerName ?>')">{{item.location.city}}</div>
<div class="si-label civic-address" ng-show="layoutAllowVar('address','<?php echo $layerName ?>')">{{item.location.civic_address}}</div>
<div class="si-label region" ng-show="layoutAllowVar('region','<?php echo $layerName ?>')">{{item.location.region}}</div>


<div class="si-label category" ng-show="layoutAllowVar('category','<?php echo $layerName ?>')">{{item.category }}</div>
<div class="si-label subcategory" ng-show="layoutAllowVar('subcategory','<?php echo $layerName ?>')">{{item.subcategory}}</div>
<div class="si-label ref-number" ng-show="layoutAllowVar('ref_number','<?php echo $layerName ?>')">{{item.ref_number}}</div>

<div class="si-label available_area" ng-show="layoutAllowVar('available_area','<?php echo $layerName ?>')">{{item.available_area}} {{item.available_area_unit}}</div>

<div class="si-label" ng-show="layoutAllowVar('rooms','<?php echo $layerName ?>')">
    <div class="rooms">
        <div class="room {{icon}}" ng-repeat="(icon,room) in item.rooms"><i class="icon fal fa-fw fa-{{icon}}"></i> <span class="count">{{room.count}}</span> <span class="label">{{room.label}}</span></div>
    </div>
</div>

<div class="si-label description" ng-show="layoutAllowVar('description','<?php echo $layerName ?>')">{{item.description}}</div>

<div class="flags" ng-show="layoutAllowVar('flags','<?php echo $layerName ?>')">
    <i class="video far fa-video"></i>
    <i class="virtual-tour far fa-vr-cardboard"></i>
</div>

<div class="si-label open-houses" ng-show="layoutAllowVar('open_houses','<?php echo $layerName ?>')">
    <div class="open-house-item">
        <i class="fal fa-calendar-alt"></i> <span>{{'Open house'.translate()}}</span> <span am-time-ago="item.open_houses[0].start_date"></span>
    </div>
</div>

<div class="si-item-link-button">
    <span class="si-button"><span><?php echo($linkButtonLabel)?></span></span>
</div>