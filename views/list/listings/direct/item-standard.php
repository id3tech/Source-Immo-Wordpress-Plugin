<article class="immodb-item immodb-listing-item immodb-standard-item-layout <?php echo($configs->list_item_layout->scope_class) ?>">
    <a href="/<?php echo(ImmoDBListingsResult::buildPermalink($item, ImmoDB::current()->get_listing_permalink())) ?>">
        <div class="content">
            <div class="image"><img src="<?php echo($item->photo_url);?>" /></div>
            <div class="price"><?php echo(ImmoDBListingsResult::formatPrice($item->price));?></div>
            <div class="civic-address"><?php echo($item->civic_address);?></div>
            <div class="ref_number"><?php echo($item->ref_number);?></div>
            <div class="city"><?php echo($item->location->city);?></div>
            <div class="region"><?php echo($item->location->region);?></div>
            <div class="category"><?php echo($item->category);?></div>
            <div class="subcategory"><?php echo($item->subcategory);?></div>
            <div class="description"><?php echo(isset($item->description) ? $item->description : '');?></div>
        </div>
    </a>
</article>