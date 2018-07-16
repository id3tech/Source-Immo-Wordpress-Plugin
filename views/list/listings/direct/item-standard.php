<article class="immodb-item <?php echo($configs->list_item_layout->scope_class) ?>">
    <a href="/<?php echo(ImmoDBListingsResult::buildPermalink($item, ImmoDB::current()->get_listing_permalink())) ?>">
        <div class="content">
            <div class="image"><img src="<?php echo($item->photo_url);?>" /></div>
            <div class="price"><?php echo(ImmoDBListingsResult::formatPrice($item->price));?></div>
            <div class="ref_number"><?php echo($item->ref_number);?></div>
            <div class="category"><?php echo($dictionary->getCaption($item->category , 'listing_category'));?></div>
            <div class="subcategory"><?php echo($dictionary->getCaption($item->subcategory , 'listing_subcategory'));?></div>
            <div class="description"><?php echo(isset($item->description) ? $item->description : '');?></div>
        </div>
    </a>
</article>