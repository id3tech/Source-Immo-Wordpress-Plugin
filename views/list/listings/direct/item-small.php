<?php
$scope_class = array();
if(isset($item->open_houses) && count($item->open_houses)>0){
    $scope_class[] = 'has-open-house';
}


if($item->status_code=='SOLD'){
    $scope_class[] = 'sold';
}

?>

<article class="si-item si-listing-item si-small-item-layout <?php echo($configs->list_item_layout->scope_class) ?> <?php echo implode(' ',$scope_class) ?>"
    itemscope itemtype="http://schema.org/Residence">
    <a itemprop="url" href="<?php echo($item->permalink) ?>">
        <div class="item-content" itemprop="name" content="<?php echo($item->subcategory);?> <?php echo($item->transaction);?>">
            <div class="image si-lazy-loading"><img si-src="<?php echo($item->photo_url);?>" si-srcset="<?php echo(apply_filters('si_listing_srcset',$item->photo_url))?>" itemprop="image" /></div>
            <div class="price"><?php echo($item->price_text);?></div>
            <div class="civic-address" itemscope itemtype="http://schema.org/PostalAddress" itemprop="address"><span itemprop="streetAddress"><?php echo($item->location->civic_address);?></span></div>
            <div class="city" itemscope itemtype="http://schema.org/PostalAddress" itemprop="address"><span itemprop="addressLocality"><?php echo($item->location->city);?></span></div>
            <div class="region"><?php echo($item->location->region);?></div>
            <div class="category"><?php echo($item->category);?></div>
            <div class="subcategory"><?php echo($item->subcategory);?></div>
            <div class="rooms">
                <?php 
                if(isset($item->rooms) && is_array($item->rooms)){
                    foreach ($item->rooms as $icon => $room) {
                        echo('<div class="room ' . $icon . '"><i class="icon fal fa-fw fa-' . $icon . '"></i> <span class="count">' . $room->count . '</span> <span class="label">' . $room->label . '</span></div>');
                    }
                }?>
            </div>
	        <div class="open-houses">
                <?php if(isset($item->open_houses) && count($item->open_houses)>0){ ?>
            	<div class="open-house-item">
                    <i class="fal fa-calendar-alt"></i> <?php si_label('Open house') ?> <span><?php echo(Moment::time_ago($item->open_houses[0]->start_date)) ?></span>
            	</div>
                <?php } ?>
	        </div>
        </div>
        
    </a>
</article>