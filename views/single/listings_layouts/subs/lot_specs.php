<div class="lot-specs si-detail-section {{sectionOpened('lot')?'opened':''}}"
    data-ng-if="isAvailableSection('lot_specs')"
    ng-show="(model.land.attributes | siHasValue) || hasDimension(model.land.dimension)">
    <div class="si-title" data-ng-click="toggleSection('lot')">
        <div><?php _e('Lot and exterior',SI) ?></div>
        <div class="si-icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
    </div>
    <div class="si-detail-section-content spec-grid">
        
        <div class="spec" data-ng-repeat="spec in model.land.attributes">
            <label>{{spec.caption}}</label>
            <div class="si-values"  ng-if="spec.values.length > 0"><span class="si-value"  data-ng-repeat="value in spec.values" ng-if="value.caption != ''">{{value.caption}}</span></div>
        </div>
    </div>
</div>