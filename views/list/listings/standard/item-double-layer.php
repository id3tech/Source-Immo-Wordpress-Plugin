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
<article class="si-item si-listing-item si-double-layer-item-layout <?php echo(implode(" ", $scope_class)) ?> {{getClassList(item)}}" ng-cloak>
    <a href="{{item.permalink}}">
        <div class="item-content">
            <div class="layer-container">
                <div class="image si-lazy-loading"><img data-si-src="{{item.photo_url}}" data-si-srcset="{{item.photo_url}}" /></div>
                
                <div class="layer primary-layer">
                    <div class="si-data-label si-background-high-contrast civic-address" ng-show="layoutAllowVar('address',true)">{{item.location.civic_address}}</div>
                    <div class="si-data-label si-background-high-contrast city" ng-show="layoutAllowVar('city',true)">{{item.location.city}}</div>
                    <div class="si-data-label si-background-high-contrast region" ng-show="layoutAllowVar('region')">{{item.location.region}}</div>
                    <div class="si-data-label si-background-medium-contrast price" ng-show="layoutAllowVar('price',true)">{{formatPrice(item)}}</div>

                    <div class="si-data-label si-background-small-contrast category" ng-show="layoutAllowVar('category')">{{item.category }}</div>
                    <div class="si-data-label si-background-small-contrast subcategory" ng-show="layoutAllowVar('subcategory',true)">{{item.subcategory}}</div>
                    <div class="si-data-label ref-number" ng-show="layoutAllowVar('ref_number')">{{item.ref_number}}</div>

                    <div class="si-data-label available_area" ng-show="layoutAllowVar('available_area')">{{item.available_area}} {{item.available_area_unit}}</div>

                    <div class="si-data-label rooms" ng-show="layoutAllowVar('rooms',true)">
                        <div class="room {{icon}}" ng-repeat="(icon,room) in item.rooms"><i class="icon fal fa-fw fa-{{icon}}"></i> <span class="count">{{room.count}}</span> <span class="label">{{room.label}}</span></div>
                    </div>
                    
                    <div class="si-data-label description" ng-show="layoutAllowVar('description')">{{item.description}}</div>
                    
                    <div class="flags" ng-show="layoutAllowVar('flags',true)">
                        <i class="video far fa-video"></i>
                        <i class="virtual-tour far fa-street-view"></i>
                    </div>
                    <div class="si-data-label open-houses" ng-show="layoutAllowVar('open_houses',true)">
                        <div class="open-house-item">
                            <i class="fal fa-calendar-alt"></i> <span>{{'Open house'.translate()}}</span> <span am-time-ago="item.open_houses[0].start_date"></span>
                        </div>
                    </div>
                    
                </div>

                <div class="layer secondary-layer"
                        style="<?php 
                        if(isset( $configs->list_item_layout->secondary_layer_bg_opacity)) echo('--bg-opacity:' . ($configs->list_item_layout->secondary_layer_bg_opacity/100));
                        ?>">
                    <div class="si-data-label price" ng-show="layoutAllowVar('price','secondary')">{{formatPrice(item)}}</div>
                    <div class="si-data-label civic-address" ng-show="layoutAllowVar('address','secondary')">{{item.location.civic_address}}</div>
                    <div class="si-data-label ref-number" ng-show="layoutAllowVar('ref_number','secondary')">{{item.ref_number}}</div>
                    <div class="si-data-label area" ng-show="layoutAllowVar('available_area','secondary')">{{item.available_area}} {{item.available_area_unit}}</div>
                    <div class="si-data-label city" ng-show="layoutAllowVar('city','secondary')">{{item.location.city}}</div>
                    <div class="si-data-label region" ng-show="layoutAllowVar('region','secondary')">{{item.location.region}}</div>
                    <div class="si-data-label category" ng-show="layoutAllowVar('category','secondary')">{{item.category }}</div>
                    <div class="si-data-label subcategory" ng-show="layoutAllowVar('subcategory','secondary')">{{item.subcategory}}</div>
                    <div class="si-data-label description" ng-show="layoutAllowVar('description','secondary')">{{item.description}}</div>
                    <div class="si-data-label rooms" ng-show="layoutAllowVar('rooms','secondary')">
                        <div class="room {{icon}}" ng-repeat="(icon,room) in item.rooms"><i class="icon fal fa-fw fa-{{icon}}"></i> <span class="count">{{room.count}}</span> <span class="label">{{room.label}}</span></div>
                    </div>
                    
                    <div class="flags" ng-show="layoutAllowVar('flags','secondary')">
                        <i class="video far fa-video"></i>
                        <i class="virtual-tour far fa-street-view"></i>
                    </div>
                    <div class="si-data-label open-houses" ng-show="layoutAllowVar('open_houses','secondary')">
                        <div class="open-house-item">
                            <i class="fal fa-calendar-alt"></i> <span>{{'Open house'.translate()}}</span> <span am-time-ago="item.open_houses[0].start_date"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </a>
</article>