<?php
/**
 * Standard list item view
 */
?>
<article class="si-item si-office-item si-small-item-layout
                    <?php echo($configs->list_item_layout->scope_class) ?> {{getClassList(item)}}" 
        data-ng-cloak
    >
    <a href="{{item.permalink}}">
        <div class="item-content">
            
            <div class="si-data-label notranslate name">{{item.name}}</div>
            
            <div class="si-data-label address">
                <div itemprop="streetAddress">{{item.location.street_address}}</div> 
                <span itemprop="city">{{item.location.city}}</span>, <span>{{item.location.state}}</span>, <span>{{item.location.address.postal_code}}</span>
            </div>
            
            <div class="si-data-label office-counters">
                <div><i class="fal fa-home"></i> <em>{{item.listings_count}}</em></div>
                <div ng-if="item.brokers_count>0"><i class="fal fa-user-tie"></i> <em>{{item.brokers_count}}</em></div>
            </div>
        </div>
    </a>
</article>