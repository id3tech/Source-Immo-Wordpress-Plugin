<div class="building-specs si-detail-section {{sectionOpened('building')?'opened':''}}"
    data-ng-if="isAvailableSection('building_specs')"
    data-ng-show="[model.building.attributes, model.building.dimension] | siHasValue">
    <div class="si-title" data-ng-click="toggleSection('building')">
        <div><?php _e('Building and interior',SI) ?></div> 
        <div class="si-icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
    </div>
    <div class="si-detail-section-content spec-grid">
        <div class="spec" data-ng-repeat="spec in model.building.attributes">
            <label>{{spec.caption}}</label>
            <div ng-if="spec.values.length > 0" class="si-values"><span  class="si-value" ng-if="value.caption != ''" data-ng-repeat="value in spec.values">{{value.caption}}</span></div>
        </div>
    </div>
</div>