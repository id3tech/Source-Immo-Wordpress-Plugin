<div class="si-label si-big-emphasis si-space-emphasis name"  ng-show="layoutAllowVar('name','<?php echo $layerName ?>')">{{item.name}}</div>
<div class="si-label license-type"  ng-show="layoutAllowVar('license','<?php echo $layerName ?>')">{{item.license_type}}</div>

<div class="si-label address"   ng-show="layoutAllowVar('address','<?php echo $layerName ?>')">
    <div itemprop="streetAddress">{{item.main_office.location.street_address}}</div> 
    <span itemprop="city">{{item.main_office.location.city}}</span>, <span>{{item.main_office.location.state}}</span>, <span>{{item.main_office.location.address.postal_code}}</span>
</div>

   
<div class="phone si-label si-font-emphasis si-space-emphasis" ng-show="layoutAllowVar('phone','<?php echo $layerName ?>')">{{item.phone.main_office.office}}</div>
<div class="email si-label" ng-show="layoutAllowVar('email','<?php echo $layerName ?>')">{{item.main_office.email}}</div>


<div class="si-label" ng-if="layoutAllowVar('contacts','<?php echo $layerName ?>')">
    <div class="contacts">
        <div class="contact phone"><i class="icon fal fa-fw fa-phone"></i> <span class="label">{{item.main_office.phone.office}}</span></div>
        <div class="contact email"><i class="icon fal fa-fw fa-envelope"></i> <span class="label">{{item.main_office.email}}</span></div>
    </div>
</div>

<div class="si-label"  ng-show="layoutAllowVar('listing_count','<?php echo $layerName ?>')">
    <div class="counters">
        <div class="counter" ng-if="item.listings_count>0"><i class="icon fal fa-fw fa-home"></i> <span class="count">{{item.listings_count}}</span> <span class="label"><lstr>listing</lstr>{{item.listings_count>1 ? 's':''}}</span></div>
        <div class="counter" ng-if="item.brokers_count>0"><i class="icon fal fa-fw fa-user-tie"></i> <span class="count">{{item.brokers_count}}</span> <span class="label"><lstr>broker</lstr>{{item.brokers_count>1 ? 's':''}}</span></div>
    </div>
</div>


<div class="si-item-link-button">
    <span class="si-button"><?php echo($linkButtonLabel)?></span>
</div>