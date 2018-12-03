<?php
/**
 * Standard list item view
 */
?>
<article class="immodb-item immodb-broker-item immodb-standard-item-layout 
                    <?php echo($configs->list_item_layout->scope_class) ?> {{getClassList(item)}}" 
        data-ng-cloak
    >
    <a href="{{item.permalink}}">
        <div class="content">
            <div class="image"><img data-ng-src="{{item.photo_url}}" /></div>
            <div class="name"><span class="first-name">{{item.first_name}}</span> <span class="last-name">{{item.last_name}}</span></div>
            <div class="title">{{getCaption(item.license_type,'license_type')}}</div>
            <div class="listings-count {{item.listings_count==0 ? 'no-listings' : ''}}">
                {{(item.listings_count==0 ? 'No property yet' : item.listings_count==1 ? '1 property' : '{0} properties').translate().format(item.listings_count)}}
            </div>
            <div class="contact">
                <div class="phone">{{item.phones.cell || item.phones.office}}</div>
            </div>
        </div>
    </a>
</article>