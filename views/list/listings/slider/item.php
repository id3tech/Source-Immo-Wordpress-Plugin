
<div class="slide-background">
    <img ng-src="{{item.photo_url}}" />
</div>

<div class="slide-infos">
    <div class="title slide-data from-left">
        {{item.title}}
    </div>

    <div class="city slide-data from-left" style="--delay:0.25s" >
        {{item.location.city}}
    </div>

    <div class="address slide-data from-left" style="--delay:.5s">
        {{item.location.civic_address}}
    </div>

    <div class="price slide-data from-bottom">
        {{item.short_price}}
    </div>

    <div class="link slide-data from-bottom" style="--delay:0.75s">
        <a href="{{item.permalink}}" class="si-button"><span><?php si_label('Details') ?></span></a>
    </div>
</div>