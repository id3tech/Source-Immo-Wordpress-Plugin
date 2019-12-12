<?php
/**
 * Standard list item view
 */
?>
<article class="si-item si-broker-item si-full-item-layout 
                    <?php echo($configs->list_item_layout->scope_class) ?> {{getClassList(item)}}" 
        data-ng-cloak
    >
    <a href="{{item.permalink}}">
        <div class="item-content">
            <div class="image si-lazy-loading"><img data-ng-if="item.photo_url" data-si-src="{{item.photo_url}}" /></div>
            <div class="name"><span class="first-name">{{item.first_name}}</span> <span class="last-name">{{item.last_name}}</span></div>
            <div class="title">{{getCaption(item.license_type,'license_type')}}</div>
            <div class="contact">
                <div class="phone">{{item.phones.mobile || item.phones.office}}</div>
                <div class="email">{{item.email}}</div>
            </div>
        </div>
    </a>
</article>