
<div class="si-label si-space-emphasis si-big-emphasis price" <?php layoutAllowVar('price', $configs->list_item_layout,$layerName) ?>><?php echo($item->price_text);?></div>
<div class="si-label si-space-emphasis si-big-emphasis si-price-sold" <?php layoutAllowVar('price', $configs->list_item_layout,$layerName) ?>><?php echo($item->price_text);?></div>


<div class="si-label city si-text-truncate si-weight-emphasis" <?php layoutAllowVar('city', $configs->list_item_layout,$layerName) ?> itemscope itemtype="http://schema.org/PostalAddress" itemprop="address"><span itemprop="addressLocality"><?php echo($item->location->city);?></span></div>
<div class="si-label civic-address si-text-truncate" <?php layoutAllowVar('address', $configs->list_item_layout,$layerName) ?> itemscope itemtype="http://schema.org/PostalAddress" itemprop="address"><span itemprop="streetAddress"><?php echo($item->location->civic_address);?></span></div>
<div class="si-label region" <?php layoutAllowVar('region', $configs->list_item_layout,$layerName) ?>><?php echo($item->location->region);?></div>

<div class="si-label category" <?php layoutAllowVar('category', $configs->list_item_layout,$layerName) ?>><?php echo($item->category);?></div>
<div class="si-label subcategory" <?php layoutAllowVar('subcategory', $configs->list_item_layout,$layerName) ?>><?php echo($item->subcategory);?></div>

<div class="si-label ref-number" <?php layoutAllowVar('ref_number', $configs->list_item_layout,$layerName) ?>><?php echo($item->ref_number);?></div>

<div class="si-label available_area" <?php layoutAllowVar('available_area', $configs->list_item_layout,$layerName) ?>><?php echo($item->available_area)?> <?php echo($item->available_area_unit) ?></div>
<?php

if(isset($item->rooms)){?>
<div class="si-label" <?php layoutAllowVar('rooms', $configs->list_item_layout,$layerName) ?>>
    <div class="rooms">
        <?php 
            foreach ($item->rooms as $icon => $room) {
                echo('<div class="room ' . $icon . '"><i class="icon fal fa-fw fa-' . $icon . '"></i> <span class="count">' . $room->count . '</span> <span class="label">' . $room->label . '</span></div>');
            }
        ?>
    </div>
</div>
<?php } ?>

<div class="si-label description" <?php layoutAllowVar('description', $configs->list_item_layout,$layerName) ?> itemprop="description"><?php echo(isset($item->description) ? $item->description : '');?></div>


<div class="flags" <?php layoutAllowVar('flags', $configs->list_item_layout,$layerName) ?>>
    <i class="video far fa-video"></i>
    <i class="virtual-tour far fa-vr-cardboard"></i>
</div>

<div class="open-houses" <?php layoutAllowVar('open-houses', $configs->list_item_layout,$layerName) ?>>
    <?php if(isset($item->open_houses) && count($item->open_houses)>0){ ?>
    <div class="open-house-item">
        <i class="fal fa-calendar-alt"></i> <?php echo(apply_filters('si_label', __('Open house', SI))) ?> <span><?php echo(Moment::time_ago($item->open_houses[0]->start_date)) ?></span>
    </div>
    <?php } ?>
</div>

<div class="si-item-link-button">
    <span class="si-button"><?php echo($linkButtonLabel)?></span>
</div>