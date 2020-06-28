<div class="detail-section {{sectionOpened('other')?'opened':''}}"
        data-ng-show="model.other.attributes | siHasValue">
    <div class="title" data-ng-click="toggleSection('other')">
        <div><?php _e('Other characteristics',SI) ?></div>
        <div class="icon"><i class="fal fa-plus"></i><i class="fal fa-minus"></i></div>
    </div>
    <div class="detail-section-content spec-grid">
        <div class="spec" data-ng-repeat="spec in model.other.attributes">
            <label>{{spec.caption}}</label>
            <div><span data-ng-repeat="value in spec.values">{{value.caption}}</span></div>
        </div>
    </div>
</div>