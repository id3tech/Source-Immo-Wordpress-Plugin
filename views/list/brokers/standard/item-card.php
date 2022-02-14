/**
 * Card list item view
 */
?>
<article class="si-item si-broker-item si-card-item-layout {{getClassList(item)}}" 
        data-ng-cloak>
    <div class="photo"><img data-ng-if="item.photo_url" data-ng-src="{{item.photo_url}}" /></div>
    <div class="name">{{item.first_name}} {{item.last_name}}</div>
    <div class="license">{{ (item.title || item.license_type) | siApplyGenre : item.ref_number : item.genre | siBrokerTitle : item.ref_number}}</div>
    <div class="contact">
        <div class="phone phone-type-{{key}}" data-ng-repeat="(key,phone) in item.phones"><span class="si-label prefix">{{key.translate()}}:</span> <span class="si-value">{{phone}}</span></div>
    </div>
    <div class="actions" ng-show="hasListOf('brokers')">
        <a href="{{item.permalink}}"><button class="si-button" type="button">{{'Other properties'.translate()}}</button></a>
    </div>
    
</article>
