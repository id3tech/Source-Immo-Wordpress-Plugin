<div class="si-label fullname si-big-emphasis notranslate" <?php layoutAllowVar('fullname', $configs->list_item_layout,$layerName) ?>><?php echo($item->first_name . ' ' . $item->last_name)?></div> 
<div class="si-label first-name si-weight-emphasis notranslate" <?php layoutAllowVar('first_name', $configs->list_item_layout,$layerName) ?>><?php echo($item->first_name)?></div> 
<div class="si-label last-name si-big-emphasis notranslate" <?php layoutAllowVar('last_name', $configs->list_item_layout,$layerName) ?>><?php echo($item->last_name)?></div>

<div class="si-label title si-text-truncate"
    <?php layoutAllowVar('title', $configs->list_item_layout,$layerName) ?>><span><?php echo($item->license_type)?></span></div>

<div class="si-label office notranslate" <?php layoutAllowVar('office', $configs->list_item_layout,$layerName) ?>><?php echo($item->office->name)?></div>
<div class="si-label phone si-space-emphasis si-font-emphasis" <?php layoutAllowVar('phone', $configs->list_item_layout,$layerName) ?>><?php echo(isset($item->phones->mobile) ? $item->phones->mobile : $item->phones->office)?></div>
<div class="si-label email si-text-truncate" <?php layoutAllowVar('email', $configs->list_item_layout,$layerName) ?>><span><?php echo($item->email)?></span></div>

<div class="si-label" <?php layoutAllowVar('contacts', $configs->list_item_layout,$layerName) ?>>
    <div class="contacts ">
        <div class="contact phone">
            <i class="icon fal fa-fw fa-phone"></i> <span class="label"><?php echo(isset($item->phones->mobile) ? $item->phones->mobile : $item->phones->office)?></span></div>
        <div class="contact email">
            <i class="icon fal fa-fw fa-envelope"></i> <span class="label si-text-truncate"><?php echo($item->email)?></span></div>
    </div>
</div>

<div class="si-label listing-count" <?php layoutAllowVar('listing_count', $configs->list_item_layout,$layerName) ?>>
    <?php echo(($item->listings_count == 0 ? __("No listing",SI) : ($item->listings_count==1) )? __("1 listing",SI) : StringPrototype::format(__("{0} listings",SI),$item->listings_count) )?>
</div>

<div class="si-item-link-button">
    <span class="si-button"><span><?php echo($linkButtonLabel)?></span></span>
</div>