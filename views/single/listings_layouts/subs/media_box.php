<div class="medias select-{{selected_media}}" data-ng-controller="immodbMediaBoxCtrl" data-ng-init="init()">
    <div class="tabs">
        <button type="button" class="tab pictures {{selected_media=='pictures'?'selected':''}}" 
            data-ng-click="selectMedia('pictures')">
            <i class="fal fa-camera"></i> <span><?php _e('Pictures',IMMODB)?> ({{model.photos.length}})</span></button>
        <button type="button" class="tab videos {{selected_media=='videos'?'selected':''}}"
            data-ng-show="model.video!=undefined" 
            data-ng-click="selectMedia('videos')">
            <i class="fal fa-video"></i> <span><?php _e('Video',IMMODB)?></span></button>
        <button type="button" class="tab virtual-tours {{selected_media=='virtual-tours'?'selected':''}}"
            data-ng-show="model.virtual_tour!=undefined" data-ng-click="selectMedia('virtual-tours')">
            <i class="fal fa-street-view"></i> <span><?php _e('Virtual tour',IMMODB)?></span></button>
        <button type="button" class="tab streetview {{selected_media=='streetview'?'selected':''}}" data-ng-click="selectMedia('streetview')">
            <i class="fal fa-street-view"></i> <span><?php _e('Street view',IMMODB)?></span></button>
        <button type="button" class="tab map {{selected_media=='map'?'selected':''}}" data-ng-click="selectMedia('map')">
            <i class="fal fa-map"></i> <span><?php _e('Map',IMMODB)?></span></button>
    </div>
    <div class="viewport">
        <div class="trolley">
            <div class="tab-content picture-gallery">
                <immodb-image-slider data-immodb-pictures="model.photos" data-immodb-gap="0"></immodb-image-slider>
            </div>
            <div class="tab-content videos">
                <label class="placeholder"><?php _e('Videos',IMMODB)?></label>
                <iframe id="video-player" data-ng-src="{{model.video.trusted_url}}" allowFullscreen="1" ></iframe>
            </div>
            <div class="tab-content virtual-tours">
                <label class="placeholder"><?php _e('Virtual tour',IMMODB)?></label>
                <iframe data-ng-src="{{model.virtual_tour.trusted_url}}" allowFullscreen="1"></iframe>
            </div>
            <div class="tab-content streetview">
                <label class="placeholder"><?php _e('Street view',IMMODB)?></label>
                <immodb-streetview class="detail-streetview" latlng="{lat: model.location.latitude, lng: model.location.longitude}"></immodb-streetview>
            </div>
            <div class="tab-content map">
                <label class="placeholder"><?php _e('Map',IMMODB)?></label>
                <immodb-map class="detail-map" zoom="14" latlng="{lat: model.location.latitude, lng: model.location.longitude}"></immodb-map>
            </div>
        </div>
    </div>
</div>