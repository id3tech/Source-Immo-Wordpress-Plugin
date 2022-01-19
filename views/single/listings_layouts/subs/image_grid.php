<div class="si-image-grid">
    
    <div class="si-image-list"  si-lightbox-source>
        <div class="si-image-item si-video-item si-scroller-item" ng-if="model.video" data-video-type="{{model.video.type}}" data-video-id="{{model.video.id}}">
            <img data-ng-src="{{model.video | siVideoThumbnail : model.photos[0].url}}" alt="{{'Video'.translate()}}"/>
            <i class="fad fa-fw fa-video"></i>
        </div>

        <div class="si-image-item si-virtual-tour-item si-scroller-item" ng-if="model.virtual_tour" data-source-url="{{model.virtual_tour.url}}" data-virtual-tour-id="{{model.virtual_tour.id}}"  data-virtual-tour-type="{{model.virtual_tour.type}}">
            <img data-ng-src="{{model.virtual_tour | siVirtualTourThumbnail : model.photos[0].url}}" alt="{{'Virtual tour'.translate()}}"/>
            <i class="fad fa-fw fa-vr-cardboard"></i>
        </div>

        <div class="si-image-item" ng-repeat="img in model.photos">
            <img data-ng-src="{{img.url}}" alt="{{img | siImageCaption}}" />
            <div class="caption"><label>{{img | siImageCaption}}</label></div>
        </div>
    </div>
    
</div>