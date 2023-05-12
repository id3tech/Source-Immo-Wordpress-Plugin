<div class="si-detail-section other-specs {{sectionOpened('other')?'opened':''}}"
        data-ng-if="isAvailableSection('other_specs')"
        data-ng-show="model.other.attributes | siHasValue">
    <div class="si-title" data-ng-click="toggleSection('other')">
        <div><?php _e('Other characteristics',SI) ?></div>
        <div class="si-icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
    </div>
    <div class="si-detail-section-content spec-grid">
        <div class="spec" data-ng-repeat="spec in model.other.attributes">
            <label>{{spec.caption}}</label>
            <div class="si-values" ng-if="spec.values.length > 0"><span ng-if="value.caption != ''" class="si-value" data-ng-repeat="value in spec.values">{{value.caption}}</span></div>
        </div>
    </div>
</div>