<div class="si-image-gallery" si-adaptative-class>
    
    <div class="si-image-list si-list-scroller" si-lightbox-source>
        <div class="si-image-item si-video-item si-scroller-item" ng-if="model.video" data-video-type="{{model.video.type}}" data-video-id="{{model.video.id}}" data-video-url="{{model.video.url}}">
            <img data-ng-src="{{model.video | siVideoThumbnail : model.photos[0].url}}" alt="{{'Video'.translate()}}"/>
            <i class="fal fa-fw fa-video"></i>
        </div>

        <div class="si-image-item si-virtual-tour-item si-scroller-item" ng-if="model.virtual_tour" data-source-url="{{model.virtual_tour.url}}" data-virtual-tour-id="{{model.virtual_tour.id}}"  data-virtual-tour-type="{{model.virtual_tour.type}}">
            <img data-ng-src="{{model.virtual_tour | siVirtualTourThumbnail : model.photos[0].url}}" alt="{{'Virtual tour'.translate()}}"/>
            <i class="fad fa-fw fa-vr-cardboard"></i>
        </div>

        <div class="si-image-item si-scroller-item" ng-repeat="img in model.photos">
            <img data-ng-src="{{img.url}}" alt="{{img | siImageCaption}}" />
            <div class="caption"><label>{{img | siImageCaption}}</label></div>
        </div>
    </div>
    
    <div class="si-gallery-nav">
        <div class="si-button si-nav-previous" ng-click="listScrollLeft()"><i class="fal fa-fw fa-arrow-left"></i></div>
        <div class="si-button si-nav-next" ng-click="listScrollRight()"><i class="fal fa-fw fa-arrow-right"></i></div>
    </div>
</div>