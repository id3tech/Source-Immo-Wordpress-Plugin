<?php
$classes = array();
if(isset($item->open_houses) && count($item->open_houses)>0){
    $classes[] = 'has-open-house';
}

?>

<article class="immodb-item immodb-listing-item immodb-standard-item-layout <?php echo($configs->list_item_layout->scope_class) ?> <?php echo implode(' ',$classes) ?>"
    itemscope itemtype="http://schema.org/Residence">
    <a itemprop="url" href="<?php echo($item->permalink) ?>">
        <div class="content" itemprop="name" content="<?php echo($item->subcategory);?> <?php echo($item->transaction);?>">
            <div class="image"><img src="<?php echo($item->photo_url);?>" itemprop="image" /></div>
            <div class="price"><?php echo(ImmoDBListingsResult::formatPrice($item->price));?></div>
            <div class="civic-address" itemscope itemtype="http://schema.org/PostalAddress" itemprop="address"><span itemprop="streetAddress"><?php echo($item->location->civic_address);?></span></div>
            <div class="ref_number"><?php echo($item->ref_number);?></div>
            <div class="city" itemscope itemtype="http://schema.org/PostalAddress" itemprop="address"><span itemprop="addressLocality"><?php echo($item->location->city);?></span></div>
            <div class="region"><?php echo($item->location->region);?></div>
	        <div class="open-houses">
                <?php if(isset($item->open_houses) && count($item->open_houses)>0){ ?>
            	<div class="open-house-item">
                    <i class="fal fa-calendar-alt"></i> <?php _e('Open house', IMMODB) ?> <span><?php echo(Moment::time_ago($item->open_houses[0]->start_date)) ?></span>
            	</div>
                <?php } ?>
	        </div>
        </div>
        
    </a>
</article>