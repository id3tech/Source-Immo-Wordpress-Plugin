<div class="name si-data-label si-background-high-contrast" <?php layoutAllowVar('name', $configs->list_item_layout) ?> itemprop="name"><?php echo(apply_filters('si-city-name', $item->name, 'city')) ?></div>
            <div class="code si-data-label si-background-high-contrast" <?php layoutAllowVar('code', $configs->list_item_layout) ?>><?php echo($item->code) ?></div>
            <div class="region si-data-label si-background-small-contrast " <?php layoutAllowVar('region', $configs->list_item_layout) ?>
                itemscope itemtype="http://schema.org/Place" 
                itemprop="containedInPlace">
                <span itemprop="name"><?php echo($item->location->region);?></span>
            </div>
            <div class="listings-count si-data-label" <?php layoutAllowVar('listing_count', $configs->list_item_layout) ?>><?php echo($item->listings_count)?><label> <?php echo(apply_filters('si_label', __( ($item->listings_count>1) ? 'properties' : 'property', SI))) ?></label></div>
            <div class="region-code"><?php echo($item->region_code) ?></div>