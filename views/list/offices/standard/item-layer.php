<div class="si-label notranslate name si-space-emphasis si-big-emphasis"  ng-show="layoutAllowVar('name','<?php echo $layerName ?>')">{{item.name}}</div>
<div class="si-label notranslate si-space-emphasis agency-name"  ng-show="layoutAllowVar('agency-name','<?php echo $layerName ?>')">{{item.agency.name}}</div>

<div class="si-label address" ng-show="layoutAllowVar('address','<?php echo $layerName ?>')">
    <div itemprop="streetAddress notranslate">{{item.location.street_address}}</div> 
    <span itemprop="city notranslate">{{item.location.city}}</span>, <span>{{item.location.state}}</span>, <span>{{item.location.address.postal_code}}</span>
</div>


    
<div class="phone si-label si-font-emphasis si-space-emphasis" ng-show="layoutAllowVar('phone','<?php echo $layerName ?>')">{{item.phone.office}}</div>
<div class="email si-label" ng-show="layoutAllowVar('email','<?php echo $layerName ?>')">{{item.email}}</div>


<div class="si-label" ng-if="layoutAllowVar('contacts','<?php echo $layerName ?>')">
    <div class="contacts">
        <div class="contact phone"><i class="icon fal fa-fw fa-phone"></i> <span class="label">{{item.phone.office}}</span></div>
        <div class="contact email"><i class="icon fal fa-fw fa-envelope"></i> <span class="label">{{item.email}}</span></div>
    </div>
</div>

<div class="si-label"  ng-show="layoutAllowVar('listing_count','<?php echo $layerName ?>')">
    <div class="counters">
        <div class="counter" ng-if="item.listings_count>0"><i class="icon fal fa-fw fa-home"></i> <span class="count">{{item.listings_count}}</span> <span class="label"><lstr>listings</lstr></span></div>
        <div class="counter" ng-if="item.brokers_count>0"><i class="icon fal fa-fw fa-user-tie"></i> <span class="count">{{item.brokers_count}}</span> <span class="label"><lstr>brokers</lstr></span></div>
    </div>
</div>


<div class="si-item-link-button">
    <span class="si-button"><span><?php echo($linkButtonLabel)?></span></span>
</div>