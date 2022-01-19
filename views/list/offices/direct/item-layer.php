<div class="si-label  si-space-emphasis si-big-emphasis" itemprop="name"
    <?php layoutAllowVar('name', $configs->list_item_layout) ?>>
    <?php echo($item->name) ?>
</div>

<div class="si-label si-space-emphasis agency-name si-text-truncate"
    <?php layoutAllowVar('agency-name', $configs->list_item_layout) ?>>
    <?php echo($item->agency->name) ?>
</div>

<address class="si-label address"
    itemscope itemtype="http://schema.org/PostalAddress" 
    itemprop="address"
    <?php layoutAllowVar('address', $configs->list_item_layout) ?>>
    <div itemprop="streetAddress"><?php echo($item->location->street_address) ?></div> 
    <span itemprop="city" class="si-text-truncate"><?php echo($item->location->city) ?></span>, <span><?php echo($item->location->state) ?></span>, <span><?php echo($item->location->address->postal_code) ?></span>
</address>

<div class="si-label phone si-space-emphasis si-font-emphasis" si-link-from="" <?php layoutAllowVar('phone', $configs->list_item_layout) ?>><?php echo(isset($item->phones->mobile) ? $item->phones->mobile : $item->phones->office)?></div>
<div class="si-label email si-text-truncate" si-link-from="" <?php layoutAllowVar('email', $configs->list_item_layout) ?>><?php echo($item->email)?></div>

<div class="si-label" <?php layoutAllowVar('contacts', $configs->list_item_layout) ?>>
    <div class="contacts ">
        <div class="contact phone" si-link-from=".label"><i class="icon fal fa-fw fa-phone"></i> <span class="label"><?php echo(isset($item->phones->mobile) ? $item->phones->mobile : $item->phones->office)?></span></div>
        <div class="contact email si-text-truncate" si-link-from=".label"><i class="icon fal fa-fw fa-envelope"></i> <span class="label"><?php echo($item->email)?></span></div>
    </div>
</div>

<div class="si-label" <?php layoutAllowVar('listing_count', $configs->list_item_layout) ?>>
    <div class="counters">
        <?php if(isset($item->listings_count)){ ?><div class="counter"><i class="icon fal fa-fw fa-home"></i> <span class="count"><?php echo($item->listings_count)?></span> <span class="label"><lstr>listing</lstr><?php echo($item->listings_count > 1 ? 's':'')?></span></div><?php }?>
        <?php if(isset($item->brokers_count)){ ?><div class="counter"><i class="icon fal fa-fw fa-user-tie"></i> <span class="count"><?php echo($item->brokers_count)?></span> <span class="label"><lstr>broker</lstr><?php echo($item->brokers_count > 1 ? 's':'')?></span></div><?php }?>
    </div>
</div>


<div class="si-item-link-button">
    <span class="si-button"><?php echo($linkButtonLabel)?></span>
</div>