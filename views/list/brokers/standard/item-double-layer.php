<?php
/**
 * Standard list item view
 */
$scope_class = array();
if(isset($configs)){
    $scope_class[] = $configs->list_item_layout->scope_class;
    if(isset( $configs->list_item_layout->image_hover_effect)) $scope_class[] = 'img-hover-' . $configs->list_item_layout->image_hover_effect;
    if(isset( $configs->list_item_layout->secondary_layer_effect)) $scope_class[] = 'layer-hover-' . $configs->list_item_layout->secondary_layer_effect;
    if(isset( $configs->list_item_layout->primary_layer_position)) $scope_class[] = 'primary-layer-' . $configs->list_item_layout->primary_layer_position;
    if(isset( $configs->list_item_layout->use_styles) ){
        $scope_class[] = ($configs->list_item_layout->use_styles == true) ? 'si-stylized' : 'si-no-styles';
    }
}
?>
<article class="si-item si-broker-item si-double-layer-item-layout <?php echo(implode(" ", $scope_class)) ?> {{getClassList(item)}}" ng-cloak>
    <a href="{{item.permalink}}">
        <div class="item-content">
            <div class="layer-container">
                <div class="image  si-lazy-loading"><img data-ng-if="item.photo_url" data-si-src="{{item.photo_url}}" /></div>
            
                <div class="layer primary-layer  si-background">
                    <div class="si-data-label si-background-high-contrast fullname notranslate" ng-show="layoutAllowVar('fullname')">{{item.first_name + ' ' + item.last_name}}</div> 
                    <div class="si-data-label si-background-high-contrast first-name notranslate" ng-show="layoutAllowVar('first_name', true)">{{item.first_name}}</div> 
                    <div class="si-data-label si-background-high-contrast last-name notranslate" ng-show="layoutAllowVar('last_name', true)">{{item.last_name}}</div>
                    
                    
                    <div class="si-data-label si-background-high-contrast title" title="{{item.license_type.length > 40 ? item.license_type : ''}}"
                        ng-show="layoutAllowVar('title', true)">{{item.license_type}}</div>

                    <div class="si-data-label office si-background-small-contrast notranslate" ng-show="layoutAllowVar('office')">{{item.office.name}}</div>
                    <div class="si-data-label phone" ng-show="layoutAllowVar('phone')">{{item.phones.mobile || item.phones.office}}</div>
                    <div class="si-data-label email" ng-show="layoutAllowVar('email')">{{item.email}}</div>
                    <div class="si-data-label si-background-small-contrast listing-count" ng-show="layoutAllowVar('listing_count')">
                        {{item.listings_count == 0 ? '<?php echo(apply_filters('si_label', __("No listing",SI)))?>' : (item.listings_count==1) ? '<?php echo(apply_filters('si_label', __("1 listing",SI)))?>' :'<?php echo(apply_filters('si_label', __("{0} listings",SI)))?>'.format(item.listings_count)}}
                    </div>
                </div>

                <div class="layer secondary-layer"
                    style="<?php 
                        if(isset( $configs->list_item_layout->secondary_layer_bg_opacity)) echo('--bg-opacity:' . ($configs->list_item_layout->secondary_layer_bg_opacity/100));
                    ?>">
                    <div class="si-data-label fullname" ng-show="layoutAllowVar('fullname','secondary')">{{item.first_name + ' ' + item.last_name}}</div> 
                    <div class="si-data-label first-name" ng-show="layoutAllowVar('first_name','secondary')">{{item.first_name}}</div> 
                    <div class="si-data-label last-name" ng-show="layoutAllowVar('last_name','secondary')">{{item.last_name}}</div>
                    
                    
                    <div class="si-data-label title" title="{{item.license_type.length > 40 ? item.license_type : ''}}"
                        ng-show="layoutAllowVar('title','secondary')">{{item.license_type}}</div>

                    <div class="si-data-label office" ng-show="layoutAllowVar('office','secondary')">{{item.office.name}}</div>
                    <div class="si-data-label phone" ng-show="layoutAllowVar('phone','secondary')">{{item.phones.mobile || item.phones.office}}</div>
                    <div class="si-data-label email" ng-show="layoutAllowVar('email','secondary')">{{item.email}}</div>
                    <div class="si-data-label listing-count" ng-show="layoutAllowVar('listing_count','secondary')">
                        {{item.listings_count == 0 ? '<?php echo(apply_filters('si_label', __("No listing",SI)))?>' : (item.listings_count==1) ? '<?php echo(apply_filters('si_label', __("1 listing",SI)))?>' :'<?php echo(apply_filters('si_label', __("{0} listings",SI)))?>'.format(item.listings_count)}}
                    </div>
                </div>
            </div>
        </div>
    </a>
</article>