<?php
/**
 * Standard list item view
 */
$scope_class = array('si-item si-listing-item si-standard-item-layout si-background');
$scope_class_hover = [];
$attrs = array();
$styleActive = true;

if(isset($configs)){
    $scope_class[] = $configs->list_item_layout->scope_class;
    if(isset($configs->list_item_layout->scope_class_hover)) $scope_class_hover[] = $configs->list_item_layout->scope_class_hover;

    if(isset( $configs->list_item_layout->preset)) {
        $scope_class[] = 'style-' . $configs->list_item_layout->preset;
        $styleActive = $configs->list_item_layout->preset != 'custom';
    }

    
    if(isset( $configs->list_item_layout->image_hover_effect)){
        $scope_class[] = 'img-hover-effect-' . $configs->list_item_layout->image_hover_effect;    
        if($configs->list_item_layout->image_hover_effect == 'gallery'){
            $attrs[] = 'si-image-rotator="{{item.ref_number}}:' . $configs->alias . '"';
        }
    }
}
?>

<article 
    class="<?php echo(implode(' ', $scope_class)) ?> {{getClassList(item)}}" ng-cloak
        data-si-hover-class="<?php echo implode(' ',$scope_class_hover) ?>"
        <?php echo(implode(' ', $attrs)) ?> >
        
    <a href="{{item.permalink}}" ng-if="item">
        <div class="item-content">

            <?php
            siShowLayerVars($configs->list_item_layout->displayed_vars->main);
            ?>

            <div class="si-label-group">
                <div class="si-label si-background-high-contrast si-padding-inline  civic-address  si-weight-emphasis" ng-if="layoutAllowVar('address')">{{item.location.civic_address}}</div>
                <div class="si-label si-background-high-contrast si-padding-inline  city  si-text-truncate" ng-if="layoutAllowVar('city')">{{item.location.city}}</div>
            </div>
            <div class="image si-lazy-loading">
                <img data-si-src="{{item.photo_url}}" data-si-srcset="{{item.photo_url}}" />
            </div>
        

            <div class="flags" ng-if="layoutAllowVar('flags')">
                <i class="video far fa-video"></i>
                <i class="virtual-tour far fa-vr-cardboard"></i>
            </div>

            <div class="si-label open-houses" ng-if="layoutAllowVar('open_houses')">
                <div class="open-house-item">
                    <i class="fal fa-calendar-alt"></i> <span>{{'Open house'.translate()}}</span> <span am-time-ago="item.open_houses[0].start_date"></span>
                </div>
            </div>

                <div class="si-label si-background-small-contrast si-padding price si-big-emphasis" ng-if="layoutAllowVar('price')">{{formatPrice(item)}}</div> 
                <div class="si-label si-background-small-contrast si-padding si-price-sold si-big-emphasis" ng-if="layoutAllowVar('price')">{{formatPrice(item)}}</div>    
            
            <div class="si-label-group">
                <div class="si-label si-padding-inline  region" ng-if="layoutAllowVar('region')">{{item.location.region}}</div>

                <div class="si-label si-padding-inline  si-weight-emphasis category" ng-if="layoutAllowVar('category')">{{item.category }}</div>
                <div class="si-label si-padding-inline  subcategory" ng-if="layoutAllowVar('subcategory')">{{item.subcategory}}</div>
                <div class="si-label si-padding-inline  ref-number" ng-if="layoutAllowVar('ref_number')">{{item.ref_number}}</div>

                <div class="si-label si-padding-inline  available_area" ng-if="layoutAllowVar('available_area')">{{item.available_area}} {{item.available_area_unit}}</div>

                <div class="si-label si-padding-inline" ng-if="layoutAllowVar('rooms')">
                    <div class="rooms">
                        <div class="room {{icon}}" ng-repeat="(icon,room) in item.rooms"><i class="icon fal fa-fw fa-{{icon}}"></i> <span class="count">{{room.count}}</span> <span class="label">{{room.label}}</span></div>
                    </div>
                </div>

                <div class="si-label si-padding-inline description" ng-if="layoutAllowVar('description')">{{item.description}}</div>
            </div>

            
        </div>
    </a>
</article>