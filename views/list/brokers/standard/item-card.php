/**
 * Card list item view
 */
?>
<article class="si-item si-broker-item si-card-item-layout {{getClassList(item)}}" 
        data-ng-cloak>
    <div class="photo"><img data-ng-if="item.photo_url" data-ng-src="{{item.photo_url}}" /></div>
    <div class="name">{{item.first_name}} {{item.last_name}}</div>
    <div class="license">{{item.license_type}}</div>
    <div class="contact">
        <div class="phone" data-ng-repeat="(key,phone) in item.phones">{{key.translate()}} : {{phone}}</div>
    </div>
    <div class="actions">
        <a class="button" href="{{item.permalink}}">{{'Other properties'.translate()}}</a>
    </div>
    
</article>
