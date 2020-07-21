<div class="building-specs si-detail-section {{sectionOpened('building')?'opened':''}}"
    data-ng-if="isAvailableSection('building_specs')"
    data-ng-show="[model.building.attributes, model.building.dimension] | siHasValue">
    <div class="si-title" data-ng-click="toggleSection('building')">
        <div><?php _e('Building and interior',SI) ?></div> 
        <div class="si-icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
    </div>
    <div class="si-detail-section-content spec-grid">
        <div class="special-box" data-ng-show="model.building.construction_year!=undefined && hasDimension(model.building.dimension)" >
            <div class="built-year" data-ng-show="model.building.construction_year!=undefined">
                <label>{{'Contruction year'.translate()}}</label>
                <div class="value">{{model.building.construction_year}}</div>
            </div>
            <div class="dimension" data-ng-show="hasDimension(model.building.dimension)">
                <label>{{'Dimensions'.translate()}}</label>
                <div class="value">{{model.building.dimension | formatDimension}}</div>
            </div>
        </div>
        <div class="spec" data-ng-repeat="spec in model.building.attributes">
            <label>{{spec.caption}}</label>
            <div><span data-ng-repeat="value in spec.values">{{value.caption}}</span></div>
        </div>
    </div>
</div>