<div class="si-view-switch">
    
    <div class="si-switch-item si-list-view-switch {{display_mode.length == 1 && display_mode.includes('list') ? 'active' : ''}}"
            data-ng-click="toggleDisplay(['list'])" lstr-title="List view">
        <i class="fal fa-list"></i>
    </div>
    
    <div ng-if="hasMapKeyApi()" class="si-switch-item si-split-view-switch {{display_mode.length == 2 ? 'active' : ''}}" 
        data-ng-click="toggleDisplay(['list','map'])"  lstr-title="Split view (list / map)">
        <div class="si-split-icons">
            <i class="fal fa-list"></i>
            <i class="far fa-map-marker-alt"></i>
        </div>
    </div>
    <div ng-if="hasMapKeyApi()" class="si-switch-item si-map-view-switch {{display_mode.length == 1 && display_mode.includes('map') ? 'active' : ''}}"
            data-ng-click="toggleDisplay(['map'])" lstr-title="Map view">
        <i class="far fa-map-marker-alt"></i>
    </div>

</div>