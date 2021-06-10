<?php
/**
 * Standard list item view
 */
$scope_class = array('si-item si-office-item si-single-layer-item-layout');
$attrs = [
    'data-agency-code="{{item.agency.ref_number}}"'
];
$styleActive = true;

if(isset($configs)){
    $scope_class[] = $configs->list_item_layout->scope_class;
    
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
        <?php echo(implode(' ', $attrs)) ?> >
    <a href="{{item.permalink}}">
        <div class="item-content si-background">
            
            <div class="si-data-label notranslate name <?php echo($styleActive ? 'si-background-high-contrast' : '') ?>"  ng-show="layoutAllowVar('name',true)">{{item.name}}</div>
            <div class="si-data-label notranslate agency-name <?php echo($styleActive ? '' : '') ?>"  ng-show="layoutAllowVar('agency-name',true)">{{item.agency.name}}</div>
            
            <div class="si-data-label address <?php echo($styleActive ? '' : '') ?>"   ng-show="layoutAllowVar('address',true)">
                <div itemprop="streetAddress notranslate">{{item.location.street_address}}</div> 
                <span itemprop="city notranslate">{{item.location.city}}</span>, <span>{{item.location.state}}</span>, <span>{{item.location.address.postal_code}}</span>
            </div>
            
            <div class="si-data-label office-counters  <?php echo($styleActive ? 'si-background-small-contrast' : '') ?>"  ng-show="layoutAllowVar('listing_count',true)">
                <div><i class="fal fa-home"></i> <em>{{item.listings_count}}</em></div>
                <div ng-if="item.brokers_count>0"><i class="fal fa-user-tie"></i> <em>{{item.brokers_count}}</em></div>
            </div>
        </div>
    </a>
</article>