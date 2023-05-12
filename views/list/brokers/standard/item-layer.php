
<div class="si-label fullname si-big-emphasis notranslate notranslate" ng-show="layoutAllowVar('fullname')">{{item.first_name + ' ' + item.last_name}}</div> 
<div class="si-label first-name si-weight-emphasis notranslate" ng-show="layoutAllowVar('first_name', true)">{{item.first_name}}</div> 
<div class="si-label last-name si-big-emphasis notranslate notranslate" ng-show="layoutAllowVar('last_name', true)">{{item.last_name}}</div>


<div class="si-label title" title="{{item.license_type.length > 40 ? item.license_type : ''}}"
    ng-show="layoutAllowVar('title', true)">{{item.license_type}}</div>

<div class="si-label office notranslate" ng-show="layoutAllowVar('office')">{{item.office.name}}</div>
<div class="si-label phone" ng-show="layoutAllowVar('phone')">{{item.phones.mobile || item.phones.office}}</div>
<div class="si-label email" ng-show="layoutAllowVar('email')">{{item.email}}</div>

<div class="si-label" ng-if="layoutAllowVar('contacts')">
    <div class="contacts ">
        <div class="contact phone">
            <i class="icon fal fa-fw fa-phone"></i><span class="label">{{item.phones.mobile || item.phones.office}}</div>
        <div class="contact email" ng-if="item.email">
            <i class="icon fal fa-fw fa-envelope"></i> <span class="label">{{item.email}}</span></div>
    </div>
</div>

<div class="si-label listing-count" ng-show="layoutAllowVar('listing_count')">
    {{item.listings_count == 0 ? '<?php si_label("No listing")?>' : (item.listings_count==1) ? '<?php si_label("1 listing")?>' : '<?php si_label("{0} listings")?>'.siFormat(item.listings_count)}}
</div>


<div class="si-item-link-button">
    <span class="si-button"><span><?php echo($linkButtonLabel)?></span></span>
</div>