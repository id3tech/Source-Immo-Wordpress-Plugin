<?php
/**
 * Standard list item view
 */
?>
<article class="si-item si-broker-item si-standard-item-layout si-with-office
                    <?php echo($configs->list_item_layout->scope_class) ?> {{getClassList(item)}}" 
        data-ng-cloak
    >
    <a href="{{item.permalink}}">
        <div class="item-content">
            <div class="image  si-lazy-loading"><img data-ng-if="item.photo_url" data-si-src="{{item.photo_url}}" /></div>
            <div class="si-data-label first-name">{{item.first_name}}</div> 
            <div class="si-data-label last-name">{{item.last_name}}</div>
            
            
            <div class="si-data-label title" title="{{item.license_type.length > 40 ? item.license_type : ''}}">{{item.license_type}}</div>

            <div class="si-data-label office" >{{item.office.name}}</div>
            <div class="si-data-label phone" >{{item.phones.mobile || item.phones.office}}</div>
        </div>
    </a>
</article>