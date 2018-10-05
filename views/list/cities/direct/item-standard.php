<?php
/**
 * Standard list item view
 */

$classes = array();
?>

<article class="immodb-item immodb-listing-item immodb-standard-item-layout <?php echo($configs->list_item_layout->scope_class) ?> <?php echo implode(' ',$classes) ?>">
    <a href="<?php echo(ImmoDBListingsResult::buildPermalink($item, ImmoDB::current()->get_listing_permalink())) ?>">
        <div class="content">
            <div class="image"><img src="<?php echo($item->photo_url);?>" /></div>
            <div class="name"><?php echo($item->name) ?></div>
            <div class="ref_number"><?php echo($item->ref_number);?></div>
            <div class="region"><?php echo($item->location->region);?></div>
        </div>
        
    </a>
</article>