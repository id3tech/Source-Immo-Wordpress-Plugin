<?php
$scope_class = array('si-item si-listing-item si-double-layer-item-layout');
$attrs = array();
$styleActive = true;

if(isset($item->open_houses) && count($item->open_houses)>0){
    $classes[] = 'has-open-house';
}
if($item->status_code=='SOLD'){
    $classes[] = 'sold';
}

if(isset($configs)){
    $scope_class[] = $configs->list_item_layout->scope_class;

    if(isset( $configs->list_item_layout->image_hover_effect)) $scope_class[] = 'img-hover-' . $configs->list_item_layout->image_hover_effect;
    if(isset( $configs->list_item_layout->secondary_layer_effect)) $scope_class[] = 'layer-hover-' . $configs->list_item_layout->secondary_layer_effect;
    if(isset( $configs->list_item_layout->primary_layer_position)) $scope_class[] = 'primary-layer-' . $configs->list_item_layout->primary_layer_position;

    if(isset( $configs->list_item_layout->preset) && $configs->list_item_layout->preset) {
        $scope_class[] = 'style-' . $configs->list_item_layout->preset;
        $styleActive = $configs->list_item_layout->preset != 'custom';
    }

    if(isset( $configs->list_item_layout->image_hover_effect)){
        if($configs->list_item_layout->image_hover_effect == 'gallery'){
            $attrs[] = 'si-image-rotator="'. $item->ref_number . ':' . $configs->alias . '"';
        }
    }
}

?>

<article class="<?php echo implode(' ',$scope_class) ?>"
    <?php echo(implode(' ', $attrs)) ?> itemscope itemtype="http://schema.org/Residence">

    <a itemprop="url" href="<?php echo($item->permalink) ?>">
        <div class="item-content">
            <div class="layer-container">
                <div class="image si-lazy-loading"><img si-src="<?php echo($item->photo_url);?>" si-srcset="<?php echo(apply_filters('si_listing_srcset',$item->photo_url))?>" itemprop="image" /></div>

                <div class="layer primary-layer">
                    <div class="si-data-label si-background-high-contrast civic-address" <?php layoutAllowVar('address', $configs->list_item_layout) ?> itemscope itemtype="http://schema.org/PostalAddress" itemprop="address"><span itemprop="streetAddress"><?php echo($item->location->civic_address);?></span></div>
                    <div class="si-data-label si-background-high-contrast city" <?php layoutAllowVar('city', $configs->list_item_layout) ?> itemscope itemtype="http://schema.org/PostalAddress" itemprop="address"><span itemprop="addressLocality"><?php echo($item->location->city);?></span></div>
                    <div class="si-data-label si-background-high-contrast region" <?php layoutAllowVar('region', $configs->list_item_layout) ?>><?php echo($item->location->region);?></div>

                    <div class="si-data-label si-background-medium-contrast price" <?php layoutAllowVar('price', $configs->list_item_layout) ?>><?php echo($item->price_text);?></div>
                    
                    <div class="si-data-label category" <?php layoutAllowVar('category', $configs->list_item_layout) ?>><?php echo($item->category);?></div>
                    <div class="si-data-label subcategory" <?php layoutAllowVar('subcategory', $configs->list_item_layout) ?>><?php echo($item->subcategory);?></div>
                    
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
                            <i class="fal fa-calendar-alt"></i> <?php _e('Open house', SI) ?> <span><?php echo(Moment::time_ago($item->open_houses[0]->start_date)) ?></span>
                        </div>
                        <?php } ?>
                    </div>
                </div>

                <div class="layer secondary-layer" style="<?php if(isset( $configs->list_item_layout->secondary_layer_bg_opacity)) echo('--bg-opacity:' . ($configs->list_item_layout->secondary_layer_bg_opacity/100));?>">
                    <div class="si-data-label civic-address" <?php layoutAllowVar('address', $configs->list_item_layout,'secondary') ?> itemscope itemtype="http://schema.org/PostalAddress" itemprop="address"><span itemprop="streetAddress"><?php echo($item->location->civic_address);?></span></div>
                    <div class="si-data-label city" <?php layoutAllowVar('city', $configs->list_item_layout,'secondary') ?> itemscope itemtype="http://schema.org/PostalAddress" itemprop="address"><span itemprop="addressLocality"><?php echo($item->location->city);?></span></div>
                    <div class="si-data-label region" <?php layoutAllowVar('region', $configs->list_item_layout,'secondary') ?>><?php echo($item->location->region);?></div>

                    <div class="si-data-label price" <?php layoutAllowVar('price', $configs->list_item_layout,'secondary') ?>><?php echo($item->price_text);?></div>
                    
                    <div class="si-data-label category" <?php layoutAllowVar('category', $configs->list_item_layout,'secondary') ?>><?php echo($item->category);?></div>
                    <div class="si-data-label subcategory" <?php layoutAllowVar('subcategory', $configs->list_item_layout,'secondary') ?>><?php echo($item->subcategory);?></div>
                    
                    <div class="si-data-label ref-number" <?php layoutAllowVar('ref_number', $configs->list_item_layout,'secondary') ?>><?php echo($item->ref_number);?></div>
                    
                    <div class="si-data-label available_area" <?php layoutAllowVar('available_area', $configs->list_item_layout,'secondary') ?>><?php echo($item->available_area)?> <?php echo($item->available_area_unit) ?></div>
                    <?php

                    if(isset($item->rooms)){?>
                    <div class="si-data-label rooms" <?php layoutAllowVar('rooms', $configs->list_item_layout,'secondary') ?>>
                        <?php 
                            foreach ($item->rooms as $icon => $room) {
                                echo('<div class="room ' . $icon . '"><i class="icon fal fa-fw fa-' . $icon . '"></i> <span class="count">' . $room->count . '</span> <span class="label">' . $room->label . '</span></div>');
                            }
                        ?>
                    </div>
                    <?php } ?>

                    <div class="si-data-label description" <?php layoutAllowVar('description', $configs->list_item_layout,'secondary') ?> itemprop="description"><?php echo(isset($item->description) ? $item->description : '');?></div>
                    
                    <div class="open-houses">
                        <?php if(isset($item->open_houses) && count($item->open_houses)>0){ ?>
                        <div class="open-house-item">
                            <i class="fal fa-calendar-alt"></i> <?php _e('Open house', SI) ?> <span><?php echo(Moment::time_ago($item->open_houses[0]->start_date)) ?></span>
                        </div>
                        <?php } ?>
                    </div>
                </div>
            </div>
        </div>
    </a>
</article>