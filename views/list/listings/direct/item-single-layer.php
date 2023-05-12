<?php
$classes = array();

if(isset($item->open_houses) && count($item->open_houses)>0){
    $classes[] = 'has-open-house';
}
if($item->status_code=='SOLD'){
    $classes[] = 'sold';
}

if(isset($configs)){
    $classes[] = $configs->list_item_layout->scope_class;
    
    if(isset( $configs->list_item_layout->use_styles) && $configs->list_item_layout->use_styles) $classes[] = 'si-stylized';
}

?>

<article class="si-item si-listing-item si-standard-item-layout <?php echo($configs->list_item_layout->scope_class) ?> <?php echo implode(' ',$classes) ?>"
    
    itemscope itemtype="http://schema.org/Residence">
    <a itemprop="url" href="<?php echo($item->permalink) ?>">
        <div class="item-content" itemprop="name" content="<?php echo($item->subcategory);?> <?php echo($item->transaction);?>">
            <div class="image si-lazy-loading"><img si-src="<?php echo($item->photo_url);?>" si-srcset="<?php echo(apply_filters('si_listing_srcset',$item->photo_url))?>" itemprop="image" /></div>
            <div class="si-data-label si-background-high-contrast civic-address" <?php layoutAllowVar('address', $configs->list_item_layout) ?> itemscope itemtype="http://schema.org/PostalAddress" itemprop="address"><span itemprop="streetAddress"><?php echo($item->location->civic_address);?></span></div>
            <div class="si-data-label si-background-high-contrast city" <?php layoutAllowVar('city', $configs->list_item_layout) ?> itemscope itemtype="http://schema.org/PostalAddress" itemprop="address"><span itemprop="addressLocality"><?php echo($item->location->city);?></span></div>
            <div class="si-data-label si-background-high-contrast region" <?php layoutAllowVar('region', $configs->list_item_layout) ?>><?php echo($item->location->region);?></div>

            <div class="si-data-label si-background-medium-contrast price" <?php layoutAllowVar('price', $configs->list_item_layout) ?>><?php echo($item->price_text);?></div>
            
            <div class="si-data-label si-background-small-contrast category" <?php layoutAllowVar('category', $configs->list_item_layout) ?>><?php echo($item->category);?></div>
            <div class="si-data-label si-background-small-contrast subcategory" <?php layoutAllowVar('subcategory', $configs->list_item_layout) ?>><?php echo($item->subcategory);?></div>
            
            <div class="si-data-label ref-number" <?php layoutAllowVar('ref_number', $configs->list_item_layout) ?>><?php echo($item->ref_number);?></div>
            
            <div class="si-data-label available_area" <?php layoutAllowVar('available_area', $configs->list_item_layout) ?>><?php echo($item->available_area)?> <?php echo($item->available_area_unit) ?></div>
            <?php

            if(isset($item->rooms)){?>
            <div class="si-data-label rooms" <?php layoutAllowVar('rooms', $configs->list_item_layout) ?>>
                <?php 
                    foreach ($item->rooms as $icon => $room) {
                        echo('<div class="room ' . $icon . '"><i class="icon fal fa-fw fa-' . $icon . '"></i> <span class="count">' . $room->count . '</span> <span class="label">' . $room->label . '</span></div>');
                    }
                ?>
            </div>
            <?php } ?>

            <div class="si-data-label description" <?php layoutAllowVar('description', $configs->list_item_layout) ?> itemprop="description"><?php echo(isset($item->description) ? $item->description : '');?></div>
            
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