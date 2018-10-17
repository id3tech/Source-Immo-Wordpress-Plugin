<div class="brokers">
    <div class="broker" data-ng-repeat="broker in model.brokers">
        <div class="photo"><img data-ng-src="{{broker.photo_url}}" /></div>
        <div class="name">{{broker.first_name}} {{broker.last_name}}</div>
        <div class="license">{{broker.license_type}}</div>
        <div class="contact">
            <div class="phone" data-ng-repeat="(key,phone) in broker.phones">{{key.translate()}} : {{phone}}</div>
        </div>
        <div class="actions">
            <a class="button avia-button" href="/{{broker.detail_link}}"><button type="button">{{'{0} other properties'.translate().format(broker.listings_count-1)}}</button></a>
        </div>
    </div>
</div>