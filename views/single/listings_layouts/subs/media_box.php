<div class="medias select-{{selected_media}}">
    <div class="tabs">
        <button type="button" class="tab pictures {{selected_media=='pictures'?'selected':''}}" ng-click="selected_media='pictures'"><?php _e('Pictures',IMMODB)?></button>
        <button type="button" class="tab videos {{selected_media=='videos'?'selected':''}}" ng-click="selected_media='videos'"><?php _e('Videos',IMMODB)?></button>
        <button type="button" class="tab streetview {{selected_media=='streetview'?'selected':''}}" ng-click="selected_media='streetview'"><?php _e('Street view',IMMODB)?></button>
        <button type="button" class="tab map {{selected_media=='map'?'selected':''}}" ng-click="selected_media='map'"><?php _e('Map',IMMODB)?></button>
    </div>
    <div class="viewport">
        <div class="trolley">
            <div class="tab-content picture-gallery">
                <immodb-image-slider immodb-pictures="model.photos" immodb-gap="0"></immodb-image-slider>
            </div>
            <div class="tab-content videos">
                <label class="placeholder"><?php _e('Videos',IMMODB)?></label>
            </div>
            <div class="tab-content streetview">
                <label class="placeholder"><?php _e('Street view',IMMODB)?></label>
            </div>
            <div class="tab-content map">
                <label class="placeholder"><?php _e('Map',IMMODB)?></label>
                <immodb-map class="detail-map" zoom="14" latlng="{lat: model.location.latitude, lng: model.location.longitude}"></immodb-map>
            </div>
        </div>
    </div>
</div>