<?php
/**
 * Standard list item view
 */
$scope_class = array();
if(isset($configs)){
    $scope_class[] = $configs->list_item_layout->scope_class;
    
    if(isset( $configs->list_item_layout->use_styles) && $configs->list_item_layout->use_styles) $scope_class[] = 'si-stylized';
}
?>
<article class="si-item si-broker-item si-standard-item-layout 
        <?php echo(implode(' ', $scope_class)) ?> {{getClassList(item)}}" 
        data-ng-cloak
    >
    <a href="{{item.permalink}}">
        <div class="item-content">
            <div class="image  si-lazy-loading"><img data-ng-if="item.photo_url" data-si-src="{{item.photo_url}}" /></div>
            <div class="si-data-label si-background-high-contrast fullname" ng-show="layoutAllowVar('fullname')">{{item.first_name + ' ' + item.last_name}}</div> 
            <div class="si-data-label si-background-high-contrast first-name" ng-show="layoutAllowVar('first_name', true)">{{item.first_name}}</div> 
            <div class="si-data-label si-background-high-contrast last-name" ng-show="layoutAllowVar('last_name', true)">{{item.last_name}}</div>
            
            
            <div class="si-data-label si-background-high-contrast title" title="{{item.license_type.length > 40 ? item.license_type : ''}}"
                ng-show="layoutAllowVar('title', true)">{{item.license_type}}</div>

            <div class="si-data-label office si-background-small-contrast" ng-show="layoutAllowVar('office')">{{item.office.name}}</div>
            <div class="si-data-label phone" ng-show="layoutAllowVar('phone')">{{item.phones.mobile || item.phones.office}}</div>
            <div class="si-data-label email" ng-show="layoutAllowVar('email')">{{item.email}}</div>
            <div class="si-data-label si-background-small-contrast listing-count" ng-show="layoutAllowVar('listing_count')">
                {{item.listings_count == 0 ? '<?php _e("No listing",SI)?>' : (item.listings_count==1) ? '<?php _e("1 listing",SI)?>' :'<?php _e("{0} listings",SI)?>'.format(item.listings_count)}}
            </div>
        </div>
    </a>
</article>