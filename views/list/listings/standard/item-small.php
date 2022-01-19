<?php
/**
 * Standard list item view
 */
$scope_class = '';
if(isset($configs) && $configs !== false){
    $scope_class = (isset($configs->list_item_layout)) ? $configs->list_item_layout->scope_class : [];
}
else{
    $configs = new SourceImmoList('','listings','listings','',['address','city','price','category','subcategory','rooms']);
    //$configs->type = 'listings';
    //$configs->list_item_layout->displayed_vars->main = ['address','city','price','category','subcategory','rooms'];
}
?>
<article class="si-item si-listing-item  si-single-layer-item-layout style-standard si-border <?php echo($scope_class) ?> {{getClassList(item)}}"  
    data-ng-cloak>
    <a href="{{item.permalink}}">
        <div class="item-content">
            <div class="layer-container">
            <?php siShowStandardItemLayer($configs) ?>
                
        </div>
    </a>
</article>
<?php
/*
<div class="layer main-layer">
                    <div class="layer-content">
                        <div class="si-label-group  si-background-high-contrast si-padding">
                            <div class="si-label si-weight-emphasis si-text-truncate civic-address" >{{item.location.civic_address}}&nbsp;</div>
                            <div class="si-label city" >{{item.location.city}}</div>
                        </div>
                        <div class="image si-float-anchor si-lazy-loading"><img data-si-src="{{item.photo_url}}"  data-si-srcset="{{item.photo_url}}" /></div>
                        
                        <div class="si-label si-background-small-contrast si-padding si-big-emphasis price" >{{formatPrice(item)}}</div>
                        <div class="si-label si-background-small-contrast si-padding si-big-emphasis si-price-sold" >{{formatPrice(item)}}</div>

                        <div class="si-label-group si-padding">
                            <div class="si-label category">{{item.category }}</div>
                            <div class="si-label subcategory" >{{item.subcategory}}</div>
                            
                            <div class="si-label rooms" >
                                <div class="room {{icon}}" ng-repeat="(icon,room) in item.rooms"><i class="icon fal fa-fw fa-{{icon}}"></i> <span class="count">{{room.count}}</span> <span class="label">{{room.label}}</span></div>
                            </div>
                        </div>
                        <div class="si-label open-houses">
                            <div class="open-house-item">
                                <i class="fal fa-calendar-alt"></i> <span>{{'Open house'.translate()}}</span> <span data-am-time-ago="item.open_houses[0].start_date"></span>
                            </div>
                        </div>

                        <div class="flags" si-anchor-to="si-float-anchor">
                            <i class="video far fa-video"></i>
                            <i class="virtual-tour far fa-vr-cardboard"></i>
                        </div>
                    </div>
                </div>
                */