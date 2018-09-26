<div class="building-specs section {{sectionOpened('building')?'opened':''}}"
    ng-show="model.building.attributes != null && model.building.attributes.length > 0">
    <div class="title" ng-click="toggleSection('building')">
        <div><?php _e('Building and interior',IMMODB) ?></div> 
        <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
    </div>
    <div class="content spec-grid">
        <div class="special-box">
            <div class="built-year">
                <label>{{'Contruction year'.translate()}}</label>
                <div class="value">{{model.building.construction_year}}</div>
            </div>
            <div class="dimension" ng-show="hasDimension(model.building.dimension)">
                <label>{{'Dimension'.translate()}}</label>
                <div class="value">{{model.building.dimension | formatDimension}}</div>
            </div>
        </div>
        <div class="spec" ng-repeat="spec in model.building.attributes">
            <label>{{spec.caption}}</label>
            <div><span ng-repeat="value in spec.values">{{value.caption}}</span></div>
        </div>
    </div>
</div>