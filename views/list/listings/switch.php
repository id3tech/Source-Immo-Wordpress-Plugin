<div class="view-switch">
    
    <div class="switch-item {{display_mode=='list' ? 'active' : ''}}"
            data-ng-click="switchDisplayTo('list')">
        <i class="fal fa-list"></i>
    </div>

   <div class="switch-item {{display_mode=='map' ? 'active' : ''}}"
            data-ng-click="switchDisplayTo('map')">
        <i class="far fa-map-marker-alt"></i>
    </div>

</div>