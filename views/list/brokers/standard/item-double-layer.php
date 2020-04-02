<?php
/**
 * Standard list item view
 */
$scope_class = array();
if(isset($configs)){
    $scope_class[] = $configs->list_item_layout->scope_class;
    if(isset( $configs->list_item_layout->image_hover_effect)) $scope_class[] = 'img-hover-' . $configs->list_item_layout->image_hover_effect;
    if(isset( $configs->list_item_layout->secondary_layer_effect)) $scope_class[] = 'layer-hover-' . $configs->list_item_layout->secondary_layer_effect;
}
?>
<article class="si-item si-broker-item si-double-layer-item-layout <?php echo(implode(" ", $scope_class)) ?> {{getClassList(item)}}" ng-cloak>
    <a href="{{item.permalink}}">
        <div class="item-content">
            <div class="layer-container">
                <div class="image  si-lazy-loading"><img data-ng-if="item.photo_url" data-si-src="{{item.photo_url}}" /></div>
            
                <div class="layer primary-layer">
                    <div class="si-data-label fullname" ng-show="layoutAllowVar('fullname','main')">{{item.first_name + ' ' + item.last_name}}</div> 
                    <div class="si-data-label first-name" ng-show="layoutAllowVar('first_name','main')">{{item.first_name}}</div> 
                    <div class="si-data-label last-name" ng-show="layoutAllowVar('last_name','main')">{{item.last_name}}</div>
                    
                    
                    <div class="si-data-label title" title="{{item.license_type.length > 40 ? item.license_type : ''}}"
                        ng-show="layoutAllowVar('title','main')">{{item.license_type}}</div>

                    <div class="si-data-label office" ng-show="layoutAllowVar('office','main')">{{item.office.name}}</div>
                    <div class="si-data-label phone" ng-show="layoutAllowVar('phone','main')">{{item.phones.mobile || item.phones.office}}</div>
                    <div class="si-data-label email" ng-show="layoutAllowVar('email','main')">{{item.email}}</div>
                    <div class="si-data-label listing-count" ng-show="layoutAllowVar('listing_count','main')">
                        {{item.listings_count == 0 ? '<?php _e("No listing",SI)?>' : (item.listings_count==1) ? '<?php _e("1 listing",SI)?>' :'<?php _e("{0} listings",SI)?>'.format(item.listings_count)}}
                    </div>
                </div>

                <div class="layer secondary-layer">
                    <div class="si-data-label fullname" ng-show="layoutAllowVar('fullname','secondary')">{{item.first_name + ' ' + item.last_name}}</div> 
                    <div class="si-data-label first-name" ng-show="layoutAllowVar('first_name','secondary')">{{item.first_name}}</div> 
                    <div class="si-data-label last-name" ng-show="layoutAllowVar('last_name','secondary')">{{item.last_name}}</div>
                    
                    
                    <div class="si-data-label title" title="{{item.license_type.length > 40 ? item.license_type : ''}}"
                        ng-show="layoutAllowVar('title','secondary')">{{item.license_type}}</div>

                    <div class="si-data-label office" ng-show="layoutAllowVar('office','secondary')">{{item.office.name}}</div>
                    <div class="si-data-label phone" ng-show="layoutAllowVar('phone','secondary')">{{item.phones.mobile || item.phones.office}}</div>
                    <div class="si-data-label email" ng-show="layoutAllowVar('email','secondary')">{{item.email}}</div>
                    <div class="si-data-label listing-count" ng-show="layoutAllowVar('listing_count','secondary')">
                        {{item.listings_count == 0 ? '<?php _e("No listing",SI)?>' : (item.listings_count==1) ? '<?php _e("1 listing",SI)?>' :'<?php _e("{0} listings",SI)?>'.format(item.listings_count)}}
                    </div>
                </div>
            </div>
        </div>
    </a>
</article>