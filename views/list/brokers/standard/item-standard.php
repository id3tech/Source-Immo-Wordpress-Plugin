<?php
/**
 * Standard list item view
 */
?>
<article class="immodb-item immodb-broker-item immodb-standard-item-layout <?php echo($configs->list_item_layout->scope_class) ?> {{getClassList(item)}}"  ng-cloak>
    <a href="/<?php echo(ImmoDB::current()->get_broker_permalink()) ?>">
        <div class="content">
            <div class="image"><img ng-src="{{item.photo_url}}" /></div>
            <div class="name"><span class="first-name">{{item.first_name}}</span> <span class="last-name">{{item.last_name}}</span></div>
            <div class="title">{{getCaption(item.license_type,'license_type')}}</div>
            <div class="listings-count {{item.listings_count==0 ? 'no-listings' : ''}}">
                {{(item.listings_count==0 ? 'No property yet' : item.listings_count==1 ? '1 property' : '{0} properties').translate().format(item.listings_count)}}
            </div>
            <div class="contact">
                <div class="item" ng-show="item.email!=null">
                    <span class="type">{{'Email'.translate()}}</span> <span class="value">{{item.email}}</span>
                </div>
                <div class="item" ng-repeat="(key,phone) in item.phones">
                    <span class="type">{{key.translate()}}</span> <span class="value">{{phone}}</span>
                </div>
            </div>
        </div>
    </a>
</article>