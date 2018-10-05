<?php
$classes = array();
if(count($item->open_houses)>0){
    $classes[] = 'has-open-house';
}

?>

<article class="immodb-item immodb-listing-item immodb-standard-item-layout <?php echo($configs->list_item_layout->scope_class) ?> <?php echo implode(' ',$classes) ?>">
    <a href="<?php echo(ImmoDBListingsResult::buildPermalink($item, ImmoDB::current()->get_listing_permalink())) ?>">
        <div class="content">
            <div class="image"><img src="<?php echo($item->photo_url);?>" /></div>
            <div class="price"><?php echo(ImmoDBListingsResult::formatPrice($item->price));?></div>
            <div class="civic-address"><?php echo($item->location->civic_address);?></div>
            <div class="ref_number"><?php echo($item->ref_number);?></div>
            <div class="city"><?php echo($item->location->city);?></div>
            <div class="region"><?php echo($item->location->region);?></div>
            <div class="category"><?php echo($item->category);?></div>
            <div class="subcategory"><?php echo($item->subcategory);?></div>
            <div class="description"><?php echo(isset($item->description) ? $item->description : '');?></div>
	    <div class="open-houses">
            	<div class="open-house-item">
                     <i class="fal fa-calendar-alt"></i> <?php _e('Open house', IMMODB) ?> <span><?php echo(Moment::time_ago($item->open_houses[0]->start_date)) ?></span>
            	</div>
	    </div>
        </div>
        
    </a>
</article>